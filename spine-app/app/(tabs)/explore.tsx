import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

const steps = [
  ['01', '建立專屬專案', '建立公開儲存庫，命名為「你的使用者名稱.github.io」。'],
  ['02', '選擇靜態生成器', '新手可選 GitHub 原生支援的 Jekyll；想要更多主題可試試 Hexo 或 Hugo。'],
  ['03', '推送並發布', '把內容推送到 GitHub，透過 GitHub Actions 自動建置與佈署。'],
];

export default function GuideScreen() {
  return <ScrollView style={styles.page} contentContainerStyle={styles.content}>
    <Text style={styles.kicker}>FIELD GUIDE</Text>
    <Text style={styles.title}>用 GitHub{`\n`}搭建個人部落格</Text>
    <Text style={styles.intro}>免費、無廣告，並且可以隨心客製化。用一個儲存庫，開始建立屬於自己的網路基地。</Text>
    <View style={styles.steps}>{steps.map(([number, title, description]) => <View style={styles.step} key={number}>
      <Text style={styles.number}>{number}</Text><View style={styles.stepContent}><Text style={styles.stepTitle}>{title}</Text><Text style={styles.stepDescription}>{description}</Text></View>
    </View>)}</View>
    <View style={styles.tip}><Text style={styles.tipTitle}>給第一次開始的你</Text><Text style={styles.tipText}>GitHub 的 Pages 互動式學習專案，能在一小時內帶你完成第一篇文章與首頁設定。</Text></View>
    <Pressable style={styles.button} onPress={() => Alert.alert('已準備好！', '前往 GitHub 建立新的公開儲存庫。')}><Text style={styles.buttonText}>前往建立我的網站 →</Text></Pressable>
  </ScrollView>;
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#F7F5EF' }, content: { padding: 25, paddingTop: 65, paddingBottom: 110, maxWidth: 720, width: '100%', alignSelf: 'center' },
  kicker: { color: '#A15135', fontWeight: '800', letterSpacing: 2, fontSize: 11 }, title: { fontSize: 39, lineHeight: 48, letterSpacing: -1.8, color: '#20241F', fontWeight: '800', marginTop: 15 },
  intro: { color: '#586157', fontSize: 16, lineHeight: 27, marginTop: 20, marginBottom: 35 }, steps: { borderTopWidth: 1, borderColor: '#20241F' }, step: { flexDirection: 'row', gap: 18, paddingVertical: 23, borderBottomWidth: 1, borderColor: '#D3D2CA' },
  number: { color: '#A15135', fontSize: 12, fontWeight: '800' }, stepContent: { flex: 1 }, stepTitle: { color: '#20241F', fontSize: 18, fontWeight: '800', marginBottom: 8 }, stepDescription: { color: '#5D665C', fontSize: 14, lineHeight: 22 },
  tip: { marginTop: 32, backgroundColor: '#DDE5D6', padding: 21 }, tipTitle: { color: '#263A2E', fontWeight: '800', fontSize: 17 }, tipText: { color: '#526252', lineHeight: 22, marginTop: 7, fontSize: 14 },
  button: { marginTop: 24, backgroundColor: '#2F493A', alignItems: 'center', paddingVertical: 16 }, buttonText: { color: '#FFFDF6', fontWeight: '800', fontSize: 14 },
});
