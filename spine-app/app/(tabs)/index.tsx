import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

const posts = [
  { tag: 'GitHub Pages', title: '從零開始：用 GitHub Pages 建立你的個人網站', date: '2025.01.12', time: '6 min' },
  { tag: 'Jekyll', title: '把 Markdown 變成一篇篇好看的文章', date: '2024.12.28', time: '4 min' },
  { tag: '工作流程', title: '讓 GitHub Actions 為你自動發布內容', date: '2024.12.15', time: '5 min' },
];

export default function BlogHome() {
  const [saved, setSaved] = useState(false);

  const showSetup = () => {
    Alert.alert('開始建立', '建立公開儲存庫後，命名為「你的使用者名稱.github.io」，再開啟 Pages 設定。');
  };

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.nav}>
        <Text style={styles.brand}>MORI.</Text>
        <View style={styles.navLinks}>
          <Text style={styles.navLink}>文章</Text>
          <Text style={styles.navLink}>關於我</Text>
        </View>
      </View>

      <View style={styles.hero}>
        <Text style={styles.eyebrow}>PERSONAL NOTES · 2025</Text>
        <Text style={styles.heroTitle}>把想法，{`\n`}放到網路上。</Text>
        <Text style={styles.heroText}>一個關於數位生活、創作與持續學習的個人角落。從今天開始，寫下你的第一篇文章。</Text>
        <View style={styles.heroActions}>
          <Pressable style={styles.primaryButton} onPress={showSetup} accessibilityRole="button">
            <Text style={styles.primaryButtonText}>開始建立網站 →</Text>
          </Pressable>
          <Pressable style={styles.textButton} onPress={() => setSaved(!saved)} accessibilityRole="button">
            <Text style={styles.textButtonText}>{saved ? '已收藏指南 ♥' : '收藏這份指南 ♡'}</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>最新文章</Text>
        <Text style={styles.more}>查看全部 ↗</Text>
      </View>
      <View style={styles.postList}>
        {posts.map((post, index) => (
          <Pressable key={post.title} style={styles.post} onPress={() => Alert.alert(post.title, '文章閱讀頁即將推出。')}>
            <Text style={styles.postNumber}>0{index + 1}</Text>
            <View style={styles.postMain}>
              <Text style={styles.postTag}>{post.tag}</Text>
              <Text style={styles.postTitle}>{post.title}</Text>
            </View>
            <View style={styles.postMeta}>
              <Text style={styles.metaText}>{post.date}</Text>
              <Text style={styles.metaText}>{post.time} →</Text>
            </View>
          </Pressable>
        ))}
      </View>

      <View style={styles.callout}>
        <Text style={styles.calloutMark}>✦</Text>
        <View style={styles.calloutBody}>
          <Text style={styles.calloutTitle}>一個網址，就是你的作品集。</Text>
          <Text style={styles.calloutText}>GitHub Pages 免費、無廣告，並能搭配 Jekyll、Hexo 或 Hugo，打造完全屬於你的發表空間。</Text>
          <Pressable onPress={showSetup}><Text style={styles.calloutLink}>閱讀 GitHub Pages 入門指南 →</Text></Pressable>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.brand}>MORI.</Text>
        <Text style={styles.footerText}>Made slowly on the internet.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#F7F5EF' },
  content: { paddingHorizontal: 22, paddingTop: 22, paddingBottom: 110, maxWidth: 900, width: '100%', alignSelf: 'center' },
  nav: { borderBottomWidth: 1, borderBottomColor: '#20241F', paddingBottom: 18, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  brand: { fontSize: 20, lineHeight: 22, letterSpacing: 2, fontWeight: '900', color: '#20241F' },
  navLinks: { flexDirection: 'row', gap: 18 },
  navLink: { fontSize: 13, color: '#4D544B' },
  hero: { paddingTop: 62, paddingBottom: 58 },
  eyebrow: { color: '#A15135', fontSize: 11, fontWeight: '800', letterSpacing: 1.8, marginBottom: 18 },
  heroTitle: { color: '#20241F', fontSize: 45, lineHeight: 55, fontWeight: '800', letterSpacing: -2.2 },
  heroText: { maxWidth: 500, color: '#5A6258', fontSize: 16, lineHeight: 27, marginTop: 22 },
  heroActions: { flexDirection: 'row', alignItems: 'center', gap: 20, marginTop: 30, flexWrap: 'wrap' },
  primaryButton: { backgroundColor: '#2F493A', paddingHorizontal: 19, paddingVertical: 14, borderRadius: 3 },
  primaryButtonText: { color: '#FCFAF4', fontSize: 14, fontWeight: '700' },
  textButton: { paddingVertical: 12 },
  textButtonText: { color: '#2F493A', fontWeight: '700', fontSize: 14 },
  sectionHeader: { borderTopWidth: 1, borderTopColor: '#20241F', paddingTop: 17, paddingBottom: 7, flexDirection: 'row', justifyContent: 'space-between' },
  sectionTitle: { fontSize: 21, color: '#20241F', fontWeight: '800' },
  more: { color: '#A15135', fontSize: 13, fontWeight: '700', paddingTop: 5 },
  postList: { marginBottom: 42 },
  post: { borderBottomWidth: 1, borderBottomColor: '#D3D2CA', paddingVertical: 21, flexDirection: 'row', gap: 14 },
  postNumber: { color: '#A15135', fontSize: 12, fontWeight: '800', paddingTop: 4 },
  postMain: { flex: 1 },
  postTag: { color: '#7B8379', fontSize: 11, letterSpacing: .8, fontWeight: '700', marginBottom: 7 },
  postTitle: { color: '#20241F', fontSize: 18, lineHeight: 27, fontWeight: '700' },
  postMeta: { alignItems: 'flex-end', justifyContent: 'space-between', paddingVertical: 3 },
  metaText: { color: '#747A72', fontSize: 10 },
  callout: { backgroundColor: '#DDE5D6', padding: 25, flexDirection: 'row', gap: 17, borderRadius: 2 },
  calloutMark: { color: '#A15135', fontSize: 21 },
  calloutBody: { flex: 1 },
  calloutTitle: { color: '#263A2E', fontSize: 20, lineHeight: 29, fontWeight: '800' },
  calloutText: { color: '#526252', fontSize: 14, lineHeight: 22, marginTop: 10 },
  calloutLink: { color: '#A15135', fontSize: 13, fontWeight: '800', marginTop: 17 },
  footer: { paddingTop: 45, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  footerText: { color: '#777B74', fontSize: 11, fontStyle: 'italic' },
});
