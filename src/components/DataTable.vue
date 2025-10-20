<template>
  <div class="table-container">
    <table class="data-table">
      <thead>
        <tr>
          <th v-for="column in columns" :key="column.key">
            {{ column.label }}
          </th>
          <th v-if="hasActions">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, index) in data" :key="index">
          <td v-for="column in columns" :key="column.key">
            <slot :name="`cell-${column.key}`" :row="row" :value="row[column.key]">
              {{ row[column.key] }}
            </slot>
          </td>
          <td v-if="hasActions">
            <slot name="actions" :row="row"></slot>
          </td>
        </tr>
        <tr v-if="data.length === 0">
          <td :colspan="columns.length + (hasActions ? 1 : 0)" class="empty-state">
            {{ emptyMessage }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
const props = defineProps({
  columns: {
    type: Array,
    required: true
  },
  data: {
    type: Array,
    required: true
  },
  hasActions: {
    type: Boolean,
    default: true
  },
  emptyMessage: {
    type: String,
    default: 'No data available'
  }
})
</script>

<style scoped>
/* Add minimal structure styles if you want — omitted to preserve your design.
   If you need table styling included, tell me and I'll add it exactly to match. */
.table-container {
  width: 100%;
  overflow-x: auto;
}
.data-table {
  width: 100%;
  border-collapse: collapse;
}
.empty-state {
  text-align: center;
  padding: 1rem;
}
</style>
