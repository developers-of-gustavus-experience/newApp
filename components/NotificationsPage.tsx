import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  Pressable,
  Share,
  ScrollView,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { db } from "@/FirebaseConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */
type FirestorePost = {
  id: string;
  author: string;
  category: string;
  dateCreated: string;
  image?: string;
  location: string;
  text: string;
  tags?: string[];
  likes?: string[];
  comments?: number;
};

export type Category = "All" | "Library" | "Sports" | "Student Orgs" | "Events";

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
/*  Date formatting helper                                            */
/* ------------------------------------------------------------------ */
const formatPostDate = (raw: string): string => {
  const d = new Date(raw);
  if (isNaN(d.getTime())) return raw;

  const month = d.getMonth() + 1;
  const day = d.getDate();
  const year = d.getFullYear();
  let hours = d.getHours();
  const minutes = d.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "pm" : "am";
  hours = hours % 12 || 12;

  return `${month}/${day}/${year} ${hours}:${minutes}${ampm}`;
};

/* ------------------------------------------------------------------ */
/*  Helper: Firestore to UI Post                                       */
/* ------------------------------------------------------------------ */
const mapFirestoreToPost = (doc: FirestorePost, userId: string): Post => {
  return {
    id: doc.id,
    author: { name: doc.author },
    createdAt: formatPostDate(doc.dateCreated),
    location: doc.location,
    imageUrl: doc.image,
    text: doc.text,
    tags: doc.tags ?? [],
    likes: doc.likes?.length ?? 0,
    comments: doc.comments ?? 0,
    category: doc.category as Exclude<Category, "All">,
  };
};

/* ------------------------------------------------------------------ */
/*  PostCard – Updated with pointerEvents="box-none"                  */
/* ------------------------------------------------------------------ */
export const PostCard = ({
  post,
  openCommentsModal,
  commentAuthors,
  comments,
  userId,
  onToggleLike,
  isLiked,
}: {
  post: Post;
  openCommentsModal: (postId: string) => void;
  commentAuthors: string[];
  comments: string[];
  userId: string;
  onToggleLike: (postId: string) => void;
  isLiked: boolean;
}) => {
  const onShare = async () => {
    try {
      await Share.share({
        message: `${post.author.name}: ${post.text}`,
      });
    } catch {}
  };

  return (
    <View pointerEvents="box-none">
      <View style={styles.card}>
        {/* Header */}
        <View style={styles.headerRow}>
          {post.author.avatarUrl ? (
            <Image source={{ uri: post.author.avatarUrl }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarInitials}>{initials(post.author.name)}</Text>
            </View>
          )}
          <View style={{ flex: 1 }}>
            <View style={styles.nameRow}>
              <Text style={styles.name}>{post.author.name}</Text>
              <Text style={styles.dot}> to </Text>
              <Text style={styles.sub}>{post.createdAt}</Text>
            </View>
            <View style={styles.locRow}>
              <Ionicons name="location-outline" size={14} color={Palette.subtext} />
              <Text style={styles.locText}>{post.location}</Text>
            </View>
          </View>
        </View>

        {/* Image */}
        {post.imageUrl ? <Image source={{ uri: post.imageUrl }} style={styles.hero} /> : null}

        {/* Body */}
        <Text style={styles.body}>{post.text}</Text>

        {/* Tags */}
        <View style={styles.tagsRow}>
          {post.tags.map((t) => (
            <View key={t} style={styles.tagPill}>
              <Text style={styles.tagText}>#{t}</Text>
            </View>
          ))}
        </View>

        {/* Actions */}
        <View style={styles.actionsRow}>
          <Pressable style={styles.actionLeft} onPress={() => onToggleLike(post.id)}>
            <Feather
              name={isLiked ? "heart" : "heart"}
              size={18}
              color={isLiked ? "#E11D48" : Palette.subtext}
            />
            <Text style={styles.actionText}>{post.likes}</Text>
          </Pressable>

          <Pressable onPress={() => openCommentsModal(post.id)}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Feather name="message-circle" size={18} color={Palette.subtext} />
              <Text style={styles.actionText}>{post.comments}</Text>
            </View>
          </Pressable>

          <Pressable style={{ marginLeft: "auto" }} onPress={onShare} hitSlop={8}>
            <Text style={styles.shareText}>Share</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
};

/* ------------------------------------------------------------------ */
/*  Palette & Helpers                                                 */
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

export const initials = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

/* ------------------------------------------------------------------ */
/*  FilterBar & Chip                                                  */
/* ------------------------------------------------------------------ */
const Chip = ({
  label,
  selected = false,
  onPress,
}: {
  label: string;
  selected?: boolean;
  onPress?: () => void;
}) => (
  <Pressable
    onPress={onPress}
    style={[
      styles.chip,
      { backgroundColor: selected ? Palette.accent : Palette.card, borderColor: Palette.border },
    ]}
  >
    <Text style={[styles.chipText, { color: selected ? "#1B1B1B" : Palette.text }]}>{label}</Text>
  </Pressable>
);

export const FilterBar = ({
  value,
  onChange,
}: {
  value: Category;
  onChange: (v: Category) => void;
}) => {
  const items: Category[] = ["All", "Library", "Sports", "Student Orgs", "Events"];
  return (
    <View style={styles.filterWrap}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
        {items.map((item) => (
          <Chip
            key={item}
            label={item === "All" ? "All Posts" : item}
            selected={value === item}
            onPress={() => onChange(item)}
          />
        ))}
      </ScrollView>
    </View>
  );
};

/* ------------------------------------------------------------------ */
/*  MAIN SCREEN – Real-time posts + likes                             */
/* ------------------------------------------------------------------ */
export default function SocialScreen() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [filtered, setFiltered] = useState<Post[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category>("All");
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string>("");
  const [likedPostIds, setLikedPostIds] = useState<Set<string>>(new Set());
  const [postComments, setPostComments] = useState<{ [postId: string]: CommentData }>({});

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
            const data = docSnap.data() as FirestorePost;
            const postId = docSnap.id;

            const likes = Array.isArray(data.likes) ? data.likes : [];
            if (likes.includes(uid)) {
              setLikedPostIds((prev) => new Set(prev).add(postId));
            }

            const post = mapFirestoreToPost({ ...data, id: postId }, uid);
            list.push(post);

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
          Alert.alert("Error", "Could not load posts.");
          setLoading(false);
        }
      );
    };

    init();
    return () => unsubscribe?.();
  }, []);

  useEffect(() => {
    if (selectedCategory === "All") {
      setFiltered(posts);
    } else {
      setFiltered(posts.filter((p) => p.category === selectedCategory));
    }
  }, [posts, selectedCategory]);

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
    } catch (e) {
      console.error("Like error:", e);
    }
  };

  const openCommentsModal = (postId: string) => {
    Alert.alert("Comments", `Open comments for post ${postId}`);
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: Palette.bg, justifyContent: "center" }}>
        <ActivityIndicator size="large" color={Palette.accent} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Palette.bg }}>
      <FilterBar value={selectedCategory} onChange={setSelectedCategory} />

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const data = postComments[item.id] || { authors: [], comments: [] };
          const isLiked = likedPostIds.has(item.id);

          return (
            <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
              <PostCard
                post={item}
                openCommentsModal={openCommentsModal}
                commentAuthors={data.authors}
                comments={data.comments}
                userId={userId}
                onToggleLike={handleToggleLike}
                isLiked={isLiked}
              />
            </View>
          );
        }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={{ padding: 32, alignItems: "center" }}>
            <Text style={{ color: Palette.subtext }}>No posts in this category yet.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

/* ------------------------------------------------------------------ */
/*  Styles                                                            */
/* ------------------------------------------------------------------ */
export const styles = StyleSheet.create({
  filterWrap: { marginBottom: 12, paddingHorizontal: 16 },
  shareText: { color: Palette.subtext, fontWeight: "700" },
  body: { fontSize: 16, color: Palette.text, lineHeight: 22 },
  actionsRow: { flexDirection: "row", alignItems: "center", marginTop: 12 },
  actionLeft: { flexDirection: "row", alignItems: "center", gap: 6, marginRight: 18 },
  actionText: { color: Palette.subtext, fontWeight: "600" },
  tagsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 },
  tagPill: {
    backgroundColor: Palette.chipBg,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: Platform.select({ ios: 6, android: 4 }),
  },
  tagText: { color: Palette.chipText, fontWeight: "700" },
  nameRow: { flexDirection: "row", alignItems: "center" },
  name: { fontSize: 16, fontWeight: "700", color: Palette.text },
  dot: { color: Palette.subtext, marginHorizontal: 2 },
  sub: { color: Palette.subtext, fontSize: 12 },
  locRow: { flexDirection: "row", alignItems: "center", marginTop: 2, gap: 4 },
  locText: { color: Palette.subtext, fontSize: 12 },
  hero: {
    width: "100%",
    aspectRatio: 16 / 9,
    borderRadius: 10,
    marginTop: 8,
    marginBottom: 10,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  chipText: { fontSize: 14, fontWeight: "600" },
  headerRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  avatar: { width: 42, height: 42, borderRadius: 21, marginRight: 10 },
  avatarPlaceholder: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#EDEDED",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  avatarInitials: { fontWeight: "700", color: "#555" },
  card: {
    backgroundColor: Palette.card,
    borderRadius: 14,
    padding: 12,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
});