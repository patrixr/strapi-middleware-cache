<template>
	<div class="mermaid" ref="container" v-show="loaded">
		<slot></slot>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted, watchEffect } from 'vue'
import { useDarkMode  } from '@vuepress/theme-default/lib/client'

const mermaid = ref()
const container = ref()
const diagram = ref('')
const loaded = ref(false)
const darkmode = useDarkMode()

const props = defineProps<{
	id: string
}>()

const insertSvg = function(svgCode, bindFunctions){
		container.value.innerHTML = svgCode;
		loaded.value = true
};
onMounted(() => {
	diagram.value = container.value.innerText
	import("mermaid/dist/mermaid").then(m => {
		mermaid.value = m
	})
})

watchEffect(() => {
	if (mermaid.value && container.value) {
		mermaid.value.initialize({
			startOnLoad: false, 
			theme: darkmode.value ? 'dark' : 'neutral',
		});
		mermaid.value.render(props.id, diagram.value, insertSvg)
	}
})
</script>

<style lang="scss">
.mermaid {
	.actor, .messageText, .loopText, .labelText, .labelText>span {
		font-family: var(--font-family) !important;
	}
}
html.dark {
	.mermaid .actor-man circle, .mermaid line {
		stroke: #5a586a !important;
	}
	.mermaid .note {
		fill: #1f2020 !important;
	}
	.mermaid .actor {
		stroke: #5a586a !important;
	}
	.mermaid .labelBox {
		stroke: #5a586a !important;
	}
}
</style>