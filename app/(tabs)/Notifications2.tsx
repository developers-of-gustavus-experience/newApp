import React, { useEffect, useMemo, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Modal,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  TextInput,
  TouchableOpacity,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  increment,
  arrayRemove,
} from "firebase/firestore";
import { db } from "@/FirebaseConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  PostCard,
  FilterBar,
  Category,
  initials,
} from "../../components/NotificationsPage";
import { user } from "firebase-functions/v1/auth";

/* ------------------------------------------------------------------ */
/*  Types (same as in NotificationsPage)                               */
/* ------------------------------------------------------------------ */
type Post = {
  id: string;
  author: { name: string; avatarUrl?: string };
  createdAt: string;
  location: string;
  imageUrl?: string;
  text: string;
  tags: string[];
  likes: number;
  comments: number;
  category: Exclude<Category, "All">;
};

type CommentData = {
  authors: string[];
  comments: string[];
};

/* ------------------------------------------------------------------ */
/*  AsyncStorage: Persistent User ID                                  */
/* ------------------------------------------------------------------ */
const USER_ID_KEY = "app_user_id";

const getOrCreateUserId = async (): Promise<string> => {
  let userId = await AsyncStorage.getItem(USER_ID_KEY);
  if (!userId) {
    userId = Math.random().toString(36).substring(2, 10);
    await AsyncStorage.setItem(USER_ID_KEY, userId);
  }
  return userId;
};

/* ------------------------------------------------------------------ */
/*  MAIN SCREEN                                                       */
/* ------------------------------------------------------------------ */
export default function FeedScreen() {
  const [filter, setFilter] = useState<Category>("All");
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string>("");
  const [likedPostIds, setLikedPostIds] = useState<Set<string>>(new Set());

  const [postComments, setPostComments] = useState<{ [postId: string]: CommentData }>({});

  const [commentsModalVisible, setCommentsModalVisible] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [newComment, setNewComment] = useState("");

  // --------------------------------------------------------------
  // 1. Load user + real-time data
  // --------------------------------------------------------------
  useEffect(() => {
    let unsubscribe: () => void;

    const init = async () => {
      const uid = await getOrCreateUserId();
      setUserId(uid);

      const q = query(collection(db, "social"), orderBy("dateCreated", "desc"));
      unsubscribe = onSnapshot(
        q,
        async (snapshot) => {
          const list: Post[] = [];
          const commentFetches: Promise<void>[] = [];

          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const postId = docSnap.id;

            // ---------- Likes ----------
            const likes = Array.isArray(data.likes) ? data.likes : [];
            if (likes.includes(uid)) {
              setLikedPostIds((prev) => new Set(prev).add(postId));
            }

            // ---------- Date ----------
            const rawDate = data.dateCreated;
            const formatted = (() => {
              const d = new Date(rawDate);
              if (isNaN(d.getTime())) return rawDate;
              const month = d.getMonth() + 1;
              const day = d.getDate();
              const year = d.getFullYear();
              let hours = d.getHours();
              const minutes = d.getMinutes().toString().padStart(2, "0");
              const ampm = hours >= 12 ? "pm" : "am";
              hours = hours % 12 || 12;
              return `${month}/${day}/${year} ${hours}:${minutes}${ampm}`;
            })();

            list.push({
              id: postId,
              author: { name: data.author },
              createdAt: formatted,
              location: data.location,
              imageUrl: data.image,
              text: data.text,
              tags: data.tags ?? [],
              likes: likes.length,
              comments: data.comments ?? 0,
              category: data.category as Exclude<Category, "All">,
            });

            // ---------- Comments ----------
            const commentRef = doc(db, "social", postId, "comments", "comment1");
            const fetchPromise = getDoc(commentRef).then((snap) => {
              if (snap.exists()) {
                const { author = [], comment = [] } = snap.data();
                setPostComments((prev) => ({
                  ...prev,
                  [postId]: {
                    authors: Array.isArray(author) ? author : [],
                    comments: Array.isArray(comment) ? comment : [],
                  },
                }));
              } else {
                setPostComments((prev) => ({ ...prev, [postId]: { authors: [], comments: [] } }));
              }
            });
            commentFetches.push(fetchPromise);
          });

          await Promise.all(commentFetches);
          setPosts(list);
          setLoading(false);
        },
        (err) => {
          console.error("Firestore error:", err);
          setLoading(false);
        }
      );
    };

    init();
    return () => unsubscribe?.();
  }, []);

  // --------------------------------------------------------------
  // 2. Filter
  // --------------------------------------------------------------
  const filteredPosts = useMemo(() => {
    if (filter === "All") return posts;
    return posts.filter((p) => p.category === filter);
  }, [posts, filter]);

  // --------------------------------------------------------------
  // 3. Add Comment
  // --------------------------------------------------------------
  // 🔁 Load saved profile name from AsyncStorage
  const loadProfileName = async () => {
    const saved = await AsyncStorage.getItem('profileName');
    if (saved) {
      return saved;
    }
  };

  const handleAddComment = async (postId: string, commentText: string) => {
    if (!commentText.trim()) return;
    
    const commentRef = doc(db, "social", postId, "comments", "comment1");
    const postRef = doc(db, "social", postId);

    const ProfileName = await loadProfileName() || "Anonymous";
    try {
      await updateDoc(commentRef, {
        author: arrayUnion(ProfileName),
        comment: arrayUnion(commentText),
      });
      await updateDoc(postRef, { comments: increment(1) });
      setNewComment("");
    } catch (error) {
      console.error("Failed to add comment:", error);
    }
  };

  // --------------------------------------------------------------
  // 4. Toggle Like
  // --------------------------------------------------------------
  const handleToggleLike = async (postId: string) => {
    if (!userId) return;

    const postRef = doc(db, "social", postId);
    const isLiked = likedPostIds.has(postId);

    try {
      if (isLiked) {
        await updateDoc(postRef, { likes: arrayRemove(userId) });
        setLikedPostIds((prev) => {
          const next = new Set(prev);
          next.delete(postId);
          return next;
        });
      } else {
        await updateDoc(postRef, { likes: arrayUnion(userId) });
        setLikedPostIds((prev) => new Set(prev).add(postId));
      }
    } catch (error) {
      console.error("Failed to toggle like:", error);
    }
  };

  // --------------------------------------------------------------
  // 5. Modal
  // --------------------------------------------------------------
  const openCommentsModal = (postId: string) => {
    setSelectedPostId(postId);
    setCommentsModalVisible(true);
  };

  const selectedPost = selectedPostId ? posts.find((p) => p.id === selectedPostId) : null;
  const selectedComments = useMemo(() => {
    if (!selectedPostId) return { authors: [], comments: [] };
    const data = postComments[selectedPostId];
    return {
      authors: Array.isArray(data?.authors) ? data.authors : [],
      comments: Array.isArray(data?.comments) ? data.comments : [],
    };
  }, [selectedPostId, postComments]);

  // --------------------------------------------------------------
  // Render
  // --------------------------------------------------------------
  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={Palette.accent} />
          <Text style={styles.loadingText}>Loading posts...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <FlatList
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        data={filteredPosts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const postCommentData = postComments[item.id];
          const isLiked = likedPostIds.has(item.id);

          return (
            <Pressable
              onPress={() => openCommentsModal(item.id)}
              android_ripple={{ color: "#ddd" }}
              style={({ pressed }) => [
                {
                  opacity: pressed ? 0.7 : 1,
                  marginBottom: 16,
                },
              ]}
            >
              <View pointerEvents="box-none">
                <PostCard
                  post={item}
                  openCommentsModal={openCommentsModal}
                  comments={Array.isArray(postCommentData?.comments) ? postCommentData.comments : []}
                  commentAuthors={Array.isArray(postCommentData?.authors) ? postCommentData.authors : []}
                  userId={userId}
                  onToggleLike={handleToggleLike}
                  isLiked={isLiked}
                />
              </View>
            </Pressable>
          );
        }}
        ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
        ListHeaderComponent={<FilterBar value={filter} onChange={setFilter} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No posts in this category yet.</Text>
          </View>
        }
      />

      {/* ---------- Comments Modal ---------- */}
      <Modal visible={commentsModalVisible} animationType="slide" onRequestClose={() => setCommentsModalVisible(false)}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={20}>
          <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setCommentsModalVisible(false)} style={styles.backButton}>
                <Ionicons name="arrow-back" size={28} color="#007AFF" style={{ paddingRight: "95%" }} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ flex: 1, padding: 16 }}>
              {selectedPost && (
                <PostCard
                  post={selectedPost}
                  openCommentsModal={() => {}}
                  comments={selectedComments.comments}
                  commentAuthors={selectedComments.authors}
                  userId={userId}
                  onToggleLike={handleToggleLike}
                  isLiked={likedPostIds.has(selectedPost.id)}
                />
              )}

              <Text style={styles.commentsTitle}>Comments</Text>
              {selectedComments.comments.length === 0 ? (
                <Text style={styles.noCommentsText}>
                  {postComments[selectedPostId!] ? "No comments yet." : "Loading comments..."}
                </Text>
              ) : (
                selectedComments.comments.map((comment, idx) => (
                  <View key={idx} style={styles.commentItem}>
                    <Text style={styles.commentAuthor}>{selectedComments.authors[idx] || "Guest"}</Text>
                    <Text style={styles.commentText}>{comment}</Text>
                  </View>
                ))
              )}
            </ScrollView>

            <View style={styles.inputRow}>
              <TextInput
                value={newComment}
                onChangeText={setNewComment}
                placeholder="Add a comment"
                style={styles.commentInput}
                onSubmitEditing={() => selectedPostId && handleAddComment(selectedPostId, newComment)}
                returnKeyType="send"
              />
              <TouchableOpacity
                onPress={() => selectedPostId && handleAddComment(selectedPostId, newComment)}
                style={styles.sendButton}
                disabled={!newComment.trim()}
              >
                <Ionicons name="send" size={28} color={newComment.trim() ? "#007AFF" : "#ccc"} />
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

/* ------------------------------------------------------------------ */
/*  Palette & Styles                                                  */
/* ------------------------------------------------------------------ */
const Palette = {
  bg: "#F6F7FB",
  card: "#FFFFFF",
  text: "#151718",
  subtext: "#6B7280",
  chipBg: "#FFE089",
  chipText: "#3A2F00",
  accent: "#FFC107",
  border: "#E5E7EB",
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Palette.bg },
  loading: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 12, fontSize: 16, color: Palette.subtext },
  empty: { padding: 32, alignItems: "center" },
  emptyText: { color: Palette.subtext, fontSize: 16 },
  noCommentsText: { color: Palette.subtext, fontStyle: "italic", textAlign: "center", marginVertical: 16 },
  modalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "flex-end", padding: 16, borderBottomWidth: 1, borderColor: "#eee" },
  backButton: { marginLeft: "auto" },
  commentsTitle: { fontWeight: "bold", fontSize: 18, marginVertical: 12 },
  commentItem: { marginVertical: 6, padding: 10, backgroundColor: "#f9f9f9", borderRadius: 8, borderWidth: 1, borderColor: "#eee" },
  commentAuthor: { fontWeight: "600", fontSize: 14, color: Palette.accent },
  commentText: { marginTop: 2, fontSize: 15, color: Palette.text },
  inputRow: { flexDirection: "row", alignItems: "center", padding: 12, borderTopWidth: 1, borderColor: "#eee", backgroundColor: "#fafafa" },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
    marginRight: 8,
    fontSize: 16,
  },
  sendButton: { padding: 4 },
});