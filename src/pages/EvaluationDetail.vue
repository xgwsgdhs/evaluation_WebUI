<template>
  <div class="evaluation-detail">
    <h1>评估对象详情</h1>

    <div>
      <label>评估名称:</label>
      <input v-model="evaluation.name" />
    </div>

    <div>
      <label>评估描述:</label>
      <textarea v-model="evaluation.description"></textarea>
    </div>

    <div>
      <button @click="saveChanges">保存修改</button>
    </div>

    <!-- 雷达图 -->
    <div id="radar-chart" style="height: 400px;"></div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import * as echarts from 'echarts';

export default {
  name: 'EvaluationDetail',
  setup() {
    const evaluation = ref({
      name: '评估对象 1',
      description: '这是评估对象的描述'
    });

    // 模拟的雷达图数据
    const radarData = [
      { value: [10, 9, 8, 7, 6], name: '评估维度 1' },
      { value: [6, 7, 8, 9, 10], name: '评估维度 2' }
    ];

    // 保存修改
    const saveChanges = () => {
      console.log('保存修改:', evaluation.value);
    };

    // 绘制雷达图
    onMounted(() => {
      const chart = echarts.init(document.getElementById('radar-chart'));
      const option = {
        radar: {
          indicator: [
            { name: '维度 1', max: 10 },
            { name: '维度 2', max: 10 },
            { name: '维度 3', max: 10 },
            { name: '维度 4', max: 10 },
            { name: '维度 5', max: 10 }
          ]
        },
        series: [
          {
            name: '评估数据',
            type: 'radar',
            data: radarData
          }
        ]
      };
      chart.setOption(option);
    });

    return {
      evaluation,
      saveChanges
    };
  }
};
</script>

<style scoped>
.evaluation-detail {
  margin: 20px;
}

input, textarea {
  width: 100%;
  padding: 10px;
  margin: 10px 0;
}

button {
  padding: 10px 20px;
  background-color: #4CAF50;
  color: white;
  border: none;
  cursor: pointer;
}

button:hover {
  background-color: #45a049;
}
</style>
