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

    <UiDialogContent class="sm:max-w-3xl brutalist-card p-0 overflow-hidden rounded-none border-4">
      <div class="px-6 pt-10 pb-6 bg-accent border-b-4 border-black dark:border-white">
        <h2 class="font-black text-2xl text-white uppercase tracking-tighter">Branching Timeline</h2>
      </div>

      <div class="p-0 h-[600px] bg-background relative border-b-4 border-black dark:border-white overflow-y-auto brutalist-scroll scroll-smooth">
        <div v-if="!history || !history.nodes || Object.keys(history.nodes).length === 0" class="text-sm font-bold text-muted-foreground uppercase text-center py-10">
          No history found. Save to create a branch.
        </div>
        
        <div v-else class="relative w-full" :style="{ minHeight: '100%' }">
          <div class="flex" :style="{ minHeight: `${sortedNodes.length * rowHeight}px` }">
            <!-- Canvas Graph Overlay -->
            <canvas 
              ref="canvasRef" 
              class="absolute top-0 left-0 pointer-events-none z-10"
              :style="{ width: `${graphWidth}px`, height: `${sortedNodes.length * rowHeight}px` }"
            />
            
            <!-- Nodes List -->
            <div class="flex-1 z-0">
              <div 
                v-for="node in sortedNodes" 
                :key="node.id"
                class="group flex items-center border-b-2 border-black/5 dark:border-white/5 cursor-pointer hover:bg-muted transition-all relative"
                :style="{ height: `${rowHeight}px`, paddingLeft: `${graphWidth}px` }"
                @click="restore(node.id)"
                @mouseenter="hoveredNode = node"
                @mouseleave="hoveredNode = null"
              >
                <!-- Active Indicator Background -->
                <div v-if="history.currentId === node.id" class="absolute inset-0 bg-primary/5 pointer-events-none" />
                
                <div class="flex flex-col py-2 px-6">
                  <div class="font-black uppercase text-sm flex items-center gap-3">
                    <span :class="history.currentId === node.id ? 'text-primary underline decoration-2' : ''">
                      {{ node.label || 'Manual Snapshot' }}
                    </span>
                    <span v-if="history.currentId === node.id" class="bg-primary text-white text-[9px] px-1.5 py-0.5 border-2 border-black dark:border-white font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]">
                      ACTIVE
                    </span>
                  </div>
                  <div class="text-[10px] font-black opacity-40 uppercase tracking-wider mt-1">
                    {{ formatDate(node.timestamp) }}
                  </div>
                </div>

                <!-- Hover Tooltip equivalent (native-ish) -->
                <div class="ml-auto pr-6 opacity-0 group-hover:opacity-100 transition-opacity">
                   <span class="text-[10px] font-black uppercase bg-black text-white px-2 py-1 border-2 border-white shadow-[3px_3px_0px_0px_rgba(255,255,255,1)]">
                     CHECKOUT
                   </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="p-6 bg-muted flex justify-between items-center px-8 border-t-2 border-black/10 dark:border-white/10">
        <div class="text-[10px] font-black uppercase opacity-60 leading-tight max-w-xs">
          Visualizing branching history. Clicking any version will restore it. 
          New changes after checkout create new branches.
        </div>
        <UiDialogClose as-child>
          <UiButton variant="outline" size="sm" class="h-10 brutalist-button font-black uppercase px-8 rounded-none border-2">
            CLOSE
          </UiButton>
        </UiDialogClose>
      </div>
    </UiDialogContent>
  </UiDialog>
</template>

<script lang="ts" setup>
import type { DbResumeHistory, DbResumeVersionNode } from "~/utils/storage/db";

const isOpen = ref(false);
const history = ref<DbResumeHistory | null>(null);
const { data, setAndSyncToMonaco } = useDataStore();
const { setStyle } = useStyleStore();
const colorMode = useColorMode();

const canvasRef = ref<HTMLCanvasElement | null>(null);
const hoveredNode = ref<DbResumeVersionNode | null>(null);

const rowHeight = 72;
const laneWidth = 28;
const marginX = 32;
const nodeRadius = 7;
const lineWidth = 3;

const sortedNodes = computed(() => {
  if (!history.value) return [];
  return Object.values(history.value.nodes).sort((a, b) => b.timestamp - a.timestamp);
});

const nodeLanes = ref<Record<string, number>>({});
const maxLane = ref(0);

const calculateLanes = () => {
  if (!history.value) return;
  
  // Sort by timestamp ASC to assign lanes from oldest to newest
  const nodesAsc = [...Object.values(history.value.nodes)].sort((a, b) => a.timestamp - b.timestamp);
  const lanes: Record<string, number> = {};
  const parentUsedLane = new Set<string>();
  let nextFreeLane = 0;

  nodesAsc.forEach(node => {
    if (!node.parentId || lanes[node.parentId] === undefined) {
      lanes[node.id] = nextFreeLane++;
    } else {
      if (!parentUsedLane.has(node.parentId)) {
        // Take parent's lane
        lanes[node.id] = lanes[node.parentId];
        parentUsedLane.add(node.parentId);
      } else {
        // Start new lane
        lanes[node.id] = nextFreeLane++;
      }
    }
  });

  nodeLanes.value = lanes;
  maxLane.value = nextFreeLane;
};

const graphWidth = computed(() => marginX + (maxLane.value) * laneWidth + marginX);

const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

const draw = () => {
  const canvas = canvasRef.value;
  if (!canvas || !history.value) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const dpr = window.devicePixelRatio || 1;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  
  if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
    canvas.width = width * dpr;
    canvas.height = height * dpr;
  }
  
  ctx.save();
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, width, height);

  const isDark = colorMode.value === 'dark';
  const primaryColor = isDark ? '#ff4747' : '#f92f2f';
  const borderColor = isDark ? '#ffffff' : '#000000';
  const nodeBgColor = isDark ? '#1a1a1a' : '#ffffff';

  ctx.lineWidth = lineWidth;
  ctx.strokeStyle = borderColor;
  ctx.lineJoin = 'miter';
  ctx.lineCap = 'square';

  const nodes = sortedNodes.value;
  const nodesById = history.value.nodes;
  
  const getNodePos = (nodeId: string) => {
    const idx = nodes.findIndex(n => n.id === nodeId);
    if (idx === -1) return null;
    return {
      x: marginX + (nodeLanes.value[nodeId] || 0) * laneWidth,
      y: idx * rowHeight + rowHeight / 2
    };
  };

  // 1. Draw connection lines (child to parent)
  nodes.forEach((node) => {
    if (node.parentId && nodesById[node.parentId]) {
      const start = getNodePos(node.id);
      const end = getNodePos(node.parentId);
      
      if (start && end) {
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        
        if (start.x !== end.x) {
          // Brutalist elbow: vertical down then diagonal/horizontal
          // We go down to halfway between rows then horizontal/diagonal
          const midY = end.y - rowHeight / 2;
          ctx.lineTo(start.x, midY);
          ctx.lineTo(end.x, midY);
        }
        
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
      }
    }
  });

  // 2. Draw nodes
  nodes.forEach((node) => {
    const pos = getNodePos(node.id);
    if (!pos) return;

    const isCurrent = history.value?.currentId === node.id;
    const isHovered = hoveredNode.value?.id === node.id;

    // Node "ball"
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, nodeRadius, 0, Math.PI * 2);
    
    ctx.fillStyle = isCurrent ? primaryColor : (isHovered ? borderColor : nodeBgColor);
    ctx.fill();
    
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = lineWidth;
    ctx.stroke();

    // Highlight for active or hovered
    if (isCurrent || isHovered) {
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, nodeRadius + 4, 0, Math.PI * 2);
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  });

  ctx.restore();
};

watch(isOpen, async (open) => {
  if (open && data.resumeId) {
    history.value = await storageService.getHistory(data.resumeId);
    if (history.value) {
      calculateLanes();
      nextTick(() => {
        draw();
      });
    }
  }
});

watch(hoveredNode, () => {
  draw();
});

watch(colorMode, () => {
  nextTick(() => draw());
});

const restore = async (nodeId: string) => {
  if (!data.resumeId) return;

  const node = await storageService.checkoutVersion(data.resumeId, nodeId);
  if (!node) return;

  setAndSyncToMonaco("markdown", node.markdown);
  setAndSyncToMonaco("css", node.css);
  
  if (node.styles) {
    for (const [key, value] of Object.entries(node.styles)) {
      setStyle(key as any, value);
    }
  }

  // Refresh history UI
  history.value = await storageService.getHistory(data.resumeId);
  calculateLanes();
  nextTick(() => {
    draw();
  });
};
</script>

<style scoped>
.brutalist-scroll::-webkit-scrollbar {
  width: 12px;
}
.brutalist-scroll::-webkit-scrollbar-track {
  background: transparent;
  border-left: 2px solid currentColor;
  opacity: 0.1;
}
.brutalist-scroll::-webkit-scrollbar-thumb {
  background: currentColor;
  border: 2px solid transparent;
  background-clip: content-box;
}
</style>
