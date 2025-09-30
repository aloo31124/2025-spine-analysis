import { View, Text, Image, FlatList, StyleSheet } from 'react-native';


const products = [
  { id: '1', name: '商品 A', price: '$100' },
  { id: '2', name: '商品 B', price: '$200' },
  { id: '3', name: '商品 C', price: '$300' }
];

const ProductItem = ({ name, price }) => (
  <View style={styles.productItem}>
    <Image source={require('@/assets/images/product1.png')} style={styles.productImage} />
    <Text style={styles.productName}>{name}</Text>
    <Text style={styles.productPrice}>{price}</Text>
  </View>
);

export default function ProductList() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>商品列表</Text>
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ProductItem {...item} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  productItem: {
    flexDirection: 'column',
    alignItems: 'center',
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImage: {
    width: 100,
    height: 100,
    marginBottom: 8,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  productPrice: {
    fontSize: 14,
    color: 'gray',
  },
});
