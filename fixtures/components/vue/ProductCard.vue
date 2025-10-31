<template>
  <!-- Issue: Product card with multiple accessibility issues -->
  <div class="product-card">
    <!-- Issue: Clickable div instead of button or link -->
    <!-- Issue: No keyboard support -->
    <!-- Issue: No role or ARIA attributes -->
    <div class="product-image" @click="handleImageClick">
      <!-- Issue: Alt text not descriptive, includes word "image" -->
      <img :src="product.imageUrl" alt="product image" />

      <!-- Issue: Badge not announced to screen readers -->
      <div v-if="product.onSale" class="badge sale">SALE</div>
    </div>

    <div class="product-info">
      <!-- Issue: Wrong heading level without context -->
      <h2>{{ product.name }}</h2>

      <!-- Issue: Price not marked up for screen readers -->
      <!-- Issue: Original price and sale price not clearly distinguished -->
      <div class="price">
        <span v-if="product.onSale" class="original-price">${{ product.originalPrice }}</span>
        <span class="current-price">${{ product.price }}</span>
      </div>

      <!-- Issue: Star rating not accessible -->
      <!-- Issue: No text alternative for rating -->
      <div class="rating">
        <span v-for="i in 5" :key="i">
          {{ i <= product.rating ? '★' : '☆' }}
        </span>
      </div>

      <!-- Issue: Truncated description with no way to read full text -->
      <p class="description">{{ truncate(product.description) }}</p>

      <div class="actions">
        <!-- Issue: Icon-only button without accessible label -->
        <button @click="toggleFavorite">
          {{ isFavorite ? '❤️' : '🤍' }}
        </button>

        <!-- Issue: Button doesn't announce current state (added/not added) -->
        <button @click="addToCart">
          Add to Cart
        </button>

        <!-- Issue: Link without descriptive text -->
        <a :href="`/product/${product.id}`">Learn more</a>
      </div>
    </div>

    <!-- Issue: Loading state not announced to screen readers -->
    <div v-if="loading" class="loading-spinner">
      <div class="spinner"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  rating: number;
  onSale: boolean;
}

const props = defineProps<{
  product: Product;
}>();

const isFavorite = ref(false);
const loading = ref(false);

const handleImageClick = () => {
  // Issue: No keyboard support for this interaction
  console.log('Image clicked');
};

const toggleFavorite = () => {
  isFavorite.value = !isFavorite.value;
  // Issue: State change not announced to screen readers
};

const addToCart = async () => {
  loading.value = true;
  // Issue: Loading state not announced
  await new Promise(resolve => setTimeout(resolve, 1000));
  loading.value = false;
  // Issue: Success not announced
};

const truncate = (text: string) => {
  return text.length > 100 ? text.substring(0, 100) + '...' : text;
};
</script>

<style scoped>
/* Issue: Insufficient color contrast */
.product-card {
  border: 1px solid #ddd;
  padding: 16px;
}

/* Issue: Low contrast text */
.description {
  color: #999;
  background: #fff;
}

/* Issue: No focus indicator */
button {
  outline: none;
}

/* Issue: Sale badge uses color alone to convey information */
.badge.sale {
  background: red;
  color: white;
}

/* Issue: Original price struck through but not announced as original price */
.original-price {
  text-decoration: line-through;
  color: #888;
}
</style>
