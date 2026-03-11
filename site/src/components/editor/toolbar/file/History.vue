<template>
  <UiDialog v-model:open="isOpen">
    <UiDialogTrigger as-child>
      <UiButton
        class="h-full px-4 gap-x-2 !shadow-none !active:translate-x-0 !active:translate-y-0 rounded-none"
        variant="ghost-secondary"
        size="sm"
      >
        <span i-ic:baseline-history text-xl />
        <span class="hide-on-mobile text-lg uppercase font-bold">History</span>
      </UiButton>
    </UiDialogTrigger>

    <UiDialogContent class="sm:max-w-2xl brutalist-card p-0 overflow-hidden rounded-none">
      <div class="px-6 pt-10 pb-6 bg-accent border-b-2 border-black dark:border-white">
        <h2 class="font-black text-2xl text-white uppercase tracking-tighter">Branching Timeline</h2>
      </div>

      <div class="p-8 max-h-[600px] overflow-y-auto bg-background relative border-b-2 border-black dark:border-white">
        <div v-if="!history || !history.nodes || Object.keys(history.nodes).length === 0" class="text-sm font-bold text-muted-foreground uppercase text-center py-10">
          No history found. Save to create a branch.
        </div>
        
        <!-- Timeline Tree Visualization -->
        <div v-else class="flex flex-col gap-4 relative pl-4">
          <!-- Main Trunk Line -->
          <div class="absolute left-4 top-2 bottom-2 w-1 bg-black dark:bg-white opacity-20" />

          <div 
            v-for="node in (sortedNodes as any[])" 
            :key="node.id" 
            class="relative"
            :style="{ paddingLeft: `${node.depth * 24}px` }"
          >
            <div class="relative pl-8">
              <!-- Node Connector -->
              <div 
                class="absolute left-0 top-4 w-8 h-0.5 bg-black dark:bg-white"
                :class="{ 'opacity-20': history.currentId !== node.id }"
              />
              <!-- Branch Indicator for new parents -->
              <div 
                v-if="node.parentId"
                class="absolute left-0 top-[-20px] w-1 h-6 bg-black dark:bg-white opacity-20"
              />
              
              <div 
                class="brutalist-border p-4 transition-all cursor-pointer group rounded-none"
                :class="[
                  history.currentId === node.id 
                    ? 'bg-primary text-white brutalist-shadow border-black dark:border-white' 
                    : 'bg-card hover:bg-muted brutalist-shadow-sm border-black dark:border-white'
                ]"
                @click="restore(node.id)"
              >
                <div class="flex justify-between items-center">
                  <div class="flex flex-col">
                    <div class="hstack gap-2 mb-1">
                      <span class="font-black text-xs uppercase">{{ formatDate(node.timestamp) }}</span>
                      <span v-if="history.currentId === node.id" class="bg-white text-primary px-1.5 py-0.5 text-[10px] font-black uppercase leading-none flex items-center h-4">ACTIVE</span>
                    </div>
                    <span class="text-sm font-black uppercase tracking-tight">{{ node.label || 'Manual Snapshot' }}</span>
                    <span v-if="node.parentId" class="text-[10px] font-bold uppercase opacity-40">Branched from: {{ node.parentId.slice(-6) }}</span>
                  </div>
                  
                  <div class="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    <UiButton size="xs" variant="outline" class="h-7 bg-white text-black font-black uppercase rounded-none border-2 border-black">CHECKOUT</UiButton>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="p-6 bg-muted flex justify-between items-center px-8">
        <div class="text-[10px] font-black uppercase opacity-60 leading-tight max-w-60">
          Checkout any point in time. Saving will create a new branch from that version.
        </div>
        <UiDialogClose as-child>
          <UiButton variant="outline" size="sm" class="h-10 brutalist-button font-black uppercase px-8 rounded-none">
            CLOSE
          </UiButton>
        </UiDialogClose>
      </div>
    </UiDialogContent>
  </UiDialog>
</template>

<script lang="ts" setup>
import type { DbResumeHistory } from "~/utils/storage/db";

const isOpen = ref(false);
const history = ref<DbResumeHistory | null>(null);
const { data, setAndSyncToMonaco } = useDataStore();
const { setStyle } = useStyleStore();

const sortedNodes = computed(() => {
  if (!history.value) return [];
  const nodes = history.value.nodes;
  const nodesWithDepth = Object.values(nodes).map(node => {
    let depth = 0;
    let current = node;
    while (current.parentId && nodes[current.parentId]) {
      depth++;
      current = nodes[current.parentId];
    }
    return { ...node, depth };
  });
  return nodesWithDepth.sort((a, b) => b.timestamp - a.timestamp);
});

watch(isOpen, async (open) => {
  if (open && data.resumeId) {
    history.value = await storageService.getHistory(data.resumeId);
  }
});

const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleString();
};

const restore = async (nodeId: string) => {
  if (!data.resumeId) return;

  const node = await storageService.checkoutVersion(data.resumeId, nodeId);
  if (!node) return;

  setAndSyncToMonaco("markdown", node.markdown);
  setAndSyncToMonaco("css", node.css);
  
  for (const [key, value] of Object.entries(node.styles)) {
    setStyle(key as any, value);
  }

  // Refresh history UI
  history.value = await storageService.getHistory(data.resumeId);
  
  // Close dialog on mobile/small screens maybe? Let's keep it open for feedback
  // isOpen.value = false;
};
</script>
