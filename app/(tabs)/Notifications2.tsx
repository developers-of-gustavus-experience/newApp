import React, { useMemo, useState } from "react";
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
  TouchableOpacity,
  TextInput,
  Button,
  Modal,
} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
;

/** ──────────────────────────────────────────────────────────────
 *  Types
 *  ────────────────────────────────────────────────────────────*/
type Category = "All" | "Library" | "Sports" | "Weight Room";

type Post = {
  id: string;
  author: { name: string; avatarUrl?: string }; // avatarUrl optional (we render initials if none)
  createdAt: Date;
  location: string; // e.g., "Library"
  imageUrl?: string;
  text: string;
  tags: string[];
  likes: number;
  comments: number;
  category: Exclude<Category, "All">; // actual category of the post
};

/** ──────────────────────────────────────────────────────────────
 *  Demo Data (replace with Firestore later)
 *  ────────────────────────────────────────────────────────────*/
const DEMO_POSTS: Post[] = [
  {
    id: "1",
    author: { name: "Sarah M." },
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    location: "Library",
    imageUrl:
      "https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=1600&auto=format&fit=crop",
    text:
      "Beautiful sunset view from the library windows! Perfect study spot with amazing natural lighting.",
    tags: ["library", "sunset", "study"],
    likes: 24,
    comments: 5,
    category: "Library",
  },
  {
    id: "2",
    author: { name: "Mike R." },
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    location: "Campus Center",
    imageUrl:
      "https://images.unsplash.com/photo-1553532435-93d56c1b2e0c?q=80&w=1600&auto=format&fit=crop",
    text:
      "Student art pop-up in the Campus Center today—bright, bold, and seriously inspiring.",
    tags: ["art", "campus", "events"],
    likes: 12,
    comments: 3,
    category: "Sports", // just to show filtering; change as needed
  },
  {
    id: "3",
    author: { name: "Max M." },
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    location: "Lund Center",
    imageUrl:
      "https://images.unsplash.com/photo-1553532435-93d56c1b2e0c?q=80&w=1600&auto=format&fit=crop",
    text:
      "Common weight room hours and group workout sessions are back! Let’s get stronger together.",
    tags: ["weight room", "fitness", "workout"],
    likes: 53,
    comments: 5,
    category: "Weight Room", // just to show filtering; change as needed
  },
];

/** ──────────────────────────────────────────────────────────────
 *  Color tokens (swap with your Colors.ts if you have one)
 *  ────────────────────────────────────────────────────────────*/
const Palette = {
  bg: "#F6F7FB",
  card: "#FFFFFF",
  text: "#151718",
  subtext: "#6B7280",
  chipBg: "#FFE089", // warm yellow chips like the screenshot
  chipText: "#3A2F00",
  accent: "#FFC107", // top brand bar vibe (if you add a header later)
  border: "#E5E7EB",
};

/** ──────────────────────────────────────────────────────────────
 *  Helpers
 *  ────────────────────────────────────────────────────────────*/
const timeAgo = (d: Date) => {
  const diff = Math.max(1, Math.floor((Date.now() - d.getTime()) / 1000));
  const units: [number, string][] = [
    [60, "second"],
    [60, "minute"],
    [24, "hour"],
    [7, "day"],
    [4.345, "week"],
    [12, "month"],
  ];
  let val = diff;
  let i = 0;
  for (; i < units.length && val >= units[i][0]; i++) {
    val = Math.floor(val / units[i][0]);
  }
  const label = units[i - 1]?.[1] ?? "second";
  return `${val} ${label}${val > 1 ? "s" : ""} ago`;
};

const initials = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

/** ──────────────────────────────────────────────────────────────
 *  Chip
 *  ────────────────────────────────────────────────────────────*/
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

/** ──────────────────────────────────────────────────────────────
 *  FilterBar
 *  ────────────────────────────────────────────────────────────*/
const FilterBar = ({
  value,
  onChange,
}: {
  value: Category;
  onChange: (v: Category) => void;
}) => {
  const items: Category[] = ["All", "Library", "Sports", "Weight Room"];
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

/** ──────────────────────────────────────────────────────────────
 *  PostCard
 *  ────────────────────────────────────────────────────────────*/
const PostCard = ({
  post,
  openCommentsModal,
  comments,
}: {
  post: Post;
  openCommentsModal: (postId: string) => void;
  comments: { [postId: string]: string[] };
}) => {
  const [liked, setLiked] = useState(false);
  const likeCount = post.likes + (liked ? 1 : 0);

  const onShare = async () => {
    try {
      await Share.share({
        message: `${post.author.name}: ${post.text}`,
      });
    } catch {
      // ignore
    }
  };

  return (
    <View style={styles.card}>
      
        {/* Header */}
        <View style={styles.headerRow}>
          {post.author.avatarUrl ? (
            <Image source={{ uri: post.author.avatarUrl }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarInitials}>{initials(post.author.name || "User")}</Text>
            </View>
          )}
          <View style={{ flex: 1 }}>
            <View style={styles.nameRow}>
              <Text style={styles.name}>{post.author.name}</Text>
              <Text style={styles.dot}> • </Text>
              <Text style={styles.sub}>{timeAgo(post.createdAt)}</Text>
            </View>
            <View style={styles.locRow}>
              <Ionicons name="location-outline" size={14} color={Palette.subtext} />
              <Text style={styles.locText}>{post.location}</Text>
            </View>
          </View>
        </View>
        {/* Image */}
        {post.imageUrl ? (
          <Image source={{ uri: post.imageUrl }} style={styles.hero} />
        ) : null}
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

        <Pressable style={styles.actionLeft} onPress={() => setLiked((v) => !v)}>
          <Feather
            name={liked ? "heart" : "heart"}
            size={18}
            color={liked ? "#E11D48" : Palette.subtext}
          />
          <Text style={styles.actionText}>{likeCount}</Text>
        </Pressable>

      

        <Pressable onPress={() => openCommentsModal(post.id)}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Feather name="message-circle" size={18} color={Palette.subtext} />
            <Text>{comments[post.id]?.length || 0}</Text>
          </View>
        </Pressable>


        <Pressable style={{ marginLeft: "auto" }} onPress={onShare} hitSlop={8}>
          <Text style={[styles.shareText]}>Share</Text>
        </Pressable>

      </View>
    </View>
  );
};

/** ──────────────────────────────────────────────────────────────
 *  Screen
 *  ────────────────────────────────────────────────────────────*/
export default function FeedScreen() {
  const [filter, setFilter] = useState<Category>("All");
  const [comments, setComments] = useState<{ [postId: string]: string[] }>({});
  const [commentsModalVisible, setCommentsModalVisible] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [newComment, setNewComment] = useState("");

  function openCommentsModal(postId: string) {
    setSelectedPostId(postId);
    setCommentsModalVisible(true);
  }

  function handleAddComment(postId: string, comment: string) {
    setComments((prev) => ({
      ...prev,
      [postId]: [...(prev[postId] || []), comment],
    }));
    setNewComment("");
  }

  const data = useMemo(() => {
    if (filter === "All") return DEMO_POSTS;
    return DEMO_POSTS.filter((p) => p.category === filter);
  }, [filter]);

  return (
    <SafeAreaView style={styles.safe}>
      <FlatList
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PostCard
            post={item}
            openCommentsModal={openCommentsModal}
            comments={comments}
          />
        )}
        ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
        ListHeaderComponent={<FilterBar value={filter} onChange={setFilter} />}
      />
      <Modal
        visible={commentsModalVisible}
        animationType="slide"
        onRequestClose={() => setCommentsModalVisible(false)}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: "#fff", padding: 16 }}>
          <Text style={{ fontWeight: "bold", fontSize: 18, marginBottom: 12 }}>Comments</Text>
          {selectedPostId && comments[selectedPostId]?.map((comment, idx) => (
            <Text key={idx} style={{ marginVertical: 4 }}>{comment}</Text>
          ))}
          <TextInput
            value={newComment}
            onChangeText={setNewComment}
            placeholder="Add a comment"
            style={{ marginVertical: 12, borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 8 }}
          />
          <Button title="Post" onPress={() => selectedPostId && handleAddComment(selectedPostId, newComment)} />
          <Button title="Close" onPress={() => setCommentsModalVisible(false)} />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

/** ──────────────────────────────────────────────────────────────
 *  Styles
 *  ────────────────────────────────────────────────────────────*/
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Palette.bg },

  filterWrap: {
    marginBottom: 12,
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

  body: { fontSize: 16, color: Palette.text, lineHeight: 22 },

  tagsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 },
  tagPill: {
    backgroundColor: Palette.chipBg,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: Platform.select({ ios: 6, android: 4 }),
  },
  tagText: { color: Palette.chipText, fontWeight: "700" },

  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },
  actionLeft: { flexDirection: "row", alignItems: "center", gap: 6, marginRight: 18 },
  actionText: { color: Palette.subtext, fontWeight: "600" },
  shareText: { color: Palette.subtext, fontWeight: "700" },
});
