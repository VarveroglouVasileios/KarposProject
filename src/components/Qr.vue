<script setup lang="ts">
import { computed } from 'vue'
import qrcode from 'qrcode-generator'

const props = defineProps<{ text: string; label: string }>()
// The SVG string is produced by the library from our own URL, never from user HTML.
const svg = computed(() => {
  const q = qrcode(0, 'L')
  q.addData(props.text)
  q.make()
  return q.createSvgTag({ cellSize: 4, margin: 2, scalable: true })
})
</script>

<template>
  <div class="qr" role="img" :aria-label="label" v-html="svg" />
</template>
