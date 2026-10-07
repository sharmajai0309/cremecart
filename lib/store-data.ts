export const cakeProducts = [
  { id: 'belgian-chocolate', name: 'Belgian Chocolate Torte', price: 649, oldPrice: 799, rating: 4.9, reviews: 128, category: 'Chocolate cakes', badge: 'Bestseller', image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=900&q=85', description: 'A rich, dark chocolate sponge layered with silky Belgian chocolate ganache.' },
  { id: 'raspberry-velvet', name: 'Raspberry Velvet Cloud', price: 749, oldPrice: 899, rating: 4.8, reviews: 96, category: 'Red velvet cakes', badge: 'New', image: 'https://images.unsplash.com/photo-1616541823729-00fe0aacd32c?w=900&q=85', description: 'Velvety cocoa sponge, raspberry compote and cream cheese frosting.' },
  { id: 'pistachio-rasmalai', name: 'Pistachio Rasmalai Cake', price: 799, oldPrice: 949, rating: 4.9, reviews: 84, category: 'Indian fusion', badge: 'Bestseller', image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=900&q=85', description: 'A celebration of saffron, pistachio and soft rasmalai in every bite.' },
  { id: 'biscoff-stack', name: 'Biscoff Crunch Stack', price: 699, oldPrice: 849, rating: 4.7, reviews: 71, category: 'Trending flavours', badge: 'Popular', image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=900&q=85', description: 'Caramelised biscuit crunch folded into smooth cream and vanilla sponge.' },
  { id: 'strawberry-dream', name: 'Strawberry Dream Cake', price: 699, oldPrice: 799, rating: 4.8, reviews: 62, category: 'Fresh fruit cakes', badge: 'Fresh', image: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=900&q=85', description: 'Light vanilla sponge, fresh strawberries and clouds of whipped cream.' },
  { id: 'photo-cake', name: 'Your Story Photo Cake', price: 899, oldPrice: 999, rating: 4.9, reviews: 43, category: 'Photo cakes', badge: 'Personalise', image: 'https://images.unsplash.com/photo-1535141192574-5d4897c12636?w=900&q=85', description: 'Turn a favourite memory into a delicious centrepiece.' }
]

export const formatPrice = (price: number) => `₹${price.toLocaleString('en-IN')}`

export const categories = ['All cakes', 'Chocolate cakes', 'Red velvet cakes', 'Indian fusion', 'Photo cakes', 'Fresh fruit cakes', 'Designer cakes']

export const cartItem = { ...cakeProducts[0], quantity: 1 }
