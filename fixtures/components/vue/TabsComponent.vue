<template>
  <!-- Issue: Tabs component without proper ARIA attributes -->
  <div class="tabs">
    <!-- Issue: Tab list not marked with role="tablist" -->
    <!-- Issue: No keyboard navigation (arrow keys) -->
    <div class="tab-list">
      <div
        v-for="tab in tabs"
        :key="tab.id"
        :class="['tab', { active: activeTab === tab.id }]"
        @click="activeTab = tab.id"
      >
        <!-- Issue: Divs used instead of buttons -->
        <!-- Issue: Missing role="tab" -->
        <!-- Issue: Missing aria-selected -->
        <!-- Issue: Missing aria-controls -->
        <!-- Issue: Not keyboard accessible -->
        {{ tab.label }}
      </div>
    </div>

    <!-- Issue: Tab panels not marked with role="tabpanel" -->
    <!-- Issue: Missing aria-labelledby -->
    <!-- Issue: Inactive panels not properly hidden (should use hidden or aria-hidden) -->
    <div class="tab-panels">
      <div
        v-for="tab in tabs"
        :key="tab.id"
        v-show="activeTab === tab.id"
        class="tab-panel"
      >
        {{ tab.content }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

interface Tab {
  id: string;
  label: string;
  content: string;
}

const tabs: Tab[] = [
  { id: 'overview', label: 'Overview', content: 'Overview content here' },
  { id: 'features', label: 'Features', content: 'Features content here' },
  { id: 'pricing', label: 'Pricing', content: 'Pricing content here' },
];

const activeTab = ref('overview');

// Issue: No keyboard event handlers for arrow key navigation
// Issue: No Home/End key support
// Issue: No focus management
</script>

<style scoped>
/* Issue: Active tab indicated by color only */
.tab.active {
  background: #007bff;
  color: white;
}

/* Issue: No focus indicator */
.tab {
  cursor: pointer;
  padding: 10px 20px;
}

.tab:focus {
  outline: none; /* Issue: Focus indicator removed */
}
</style>
