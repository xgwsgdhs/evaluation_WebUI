<template>
  <div class="evaluation-detail">
    <h1>评估对象详情</h1>
    <div class="container">
      <!-- 返回按钮 -->
      <button class="back-button" @click="goToEvaluationManagement">返回</button>
      <div class="left-section">
        <h3>评估对象详情</h3>
        <label for="name">姓名:</label>
        <input type="text" v-model="evaluation.name" id="name" disabled />

        <div class="score-list">
          <div v-for="(score, index) in evaluation.scores" :key="index" class="score-item">
            <label :for="'score' + (index + 1)">维度 {{ index + 1 }}:</label>
            <div class="score-buttons">
              <button
                  v-for="scoreOption in [1, 2, 3, 4, 5]"
                  :key="scoreOption"
                  :class="{'active': score === scoreOption}"
                  @click="setScore(index, scoreOption)"
              >
                {{ scoreOption }}
              </button>
            </div>
          </div>
        </div>

        <button @click="saveChanges" class="save-button">保存修改</button>
      </div>

      <div class="right-section">
        <div id="radar-chart" style="height: 85vh;"></div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router'; // 引入 useRouter 用于路由跳转
import * as echarts from 'echarts';
import {BASE_URL} from "@/config.js";

export default {
  name: 'EvaluationDetail',
  props: ['name'],
  setup(props) {
    const router = useRouter();  // 获取路由实例
    const evaluation = ref({
      name: props.name,  // 从路由传递的姓名
      scores: Array(10).fill(0),  // 初始化评分为空（根据实际情况可能需要从后端加载）
      total: 0,  // 总分
      level: '', // 评估等级
    });

    const getEvaluation = async () => {
      const token = localStorage.getItem('access_token');
      const name = evaluation.value.name;

      try {
        const encodedName = encodeURIComponent(name);
        const response = await axios.get(`${BASE_URL}/evaluation?name=${encodedName}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        // 假设返回的数据结构为 { name, score1, score2, ..., score10, total, level }
        if (response.data.status_code === 200) {
          evaluation.value.name = response.data.name;
          evaluation.value.scores = [
            response.data.score1,
            response.data.score2,
            response.data.score3,
            response.data.score4,
            response.data.score5,
            response.data.score6,
            response.data.score7,
            response.data.score8,
            response.data.score9,
            response.data.score10
          ];
          evaluation.value.total = response.data.total;
          evaluation.value.level = response.data.level;

          // 数据加载完成后再渲染雷达图
          initRadarChart();  // 在获取数据后才绘制雷达图
        } else {
          alert('未找到用户评估数据');
        }
      } catch (error) {
        console.error('查询失败:', error);
        alert('查询失败，请重试');
      }
    };

    // 设置评分
    const setScore = (index, score) => {
      evaluation.value.scores[index] = score;  // 设置选中的维度评分
    };

    // 保存修改
// 保存修改后的评分
    const saveChanges = async () => {
      const token = localStorage.getItem('access_token');

      // 构造修改后的评分数据
      const updatedScores = {
        name: evaluation.value.name,
        score1: evaluation.value.scores[0],
        score2: evaluation.value.scores[1],
        score3: evaluation.value.scores[2],
        score4: evaluation.value.scores[3],
        score5: evaluation.value.scores[4],
        score6: evaluation.value.scores[5],
        score7: evaluation.value.scores[6],
        score8: evaluation.value.scores[7],
        score9: evaluation.value.scores[8],
        score10: evaluation.value.scores[9],
      };

      try {
        const encodedName = encodeURIComponent(evaluation.value.name);
        const response = await axios.put(`${BASE_URL}/evaluation?name=${encodedName}`, updatedScores, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.status === 200) {
          alert('修改成功');
          initRadarChart()
        } else {
          alert('修改失败');
        }
      } catch (error) {
        console.error('修改失败:', error);
        alert('修改失败，请重试');
      }
    };


    // 初始化雷达图
    const initRadarChart = () => {
      const chart = echarts.init(document.getElementById('radar-chart'));

      const option = {
        title: {
          text: '评估维度雷达图',
          left: 'center',
        },
        tooltip: {},
        radar: {
          indicator: [
            { name: '维度 1', max: 5 },
            { name: '维度 2', max: 5 },
            { name: '维度 3', max: 5 },
            { name: '维度 4', max: 5 },
            { name: '维度 5', max: 5 },
            { name: '维度 6', max: 5 },
            { name: '维度 7', max: 5 },
            { name: '维度 8', max: 5 },
            { name: '维度 9', max: 5 },
            { name: '维度 10', max: 5 },
          ],
        },
        series: [
          {
            name: '评分',
            type: 'radar',
            data: [
              {
                value: evaluation.value.scores,  // 使用评分数组填充雷达图数据
                name: evaluation.value.name,
              },
            ],
          },
        ],
      };

      chart.setOption(option);
    };

    onMounted(() => {
      getEvaluation();
    });

    // 返回到 /evaluation-management 页面
    const goToEvaluationManagement = () => {
      router.push('/evaluation-management');  // 跳转到评估管理页面
    };

    return {
      evaluation,
      setScore,
      saveChanges,
      getEvaluation,
      goToEvaluationManagement,
    };
  },
};
</script>

<style scoped>
.evaluation-detail {
  padding: 20px;
}

.container {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  align-items: flex-start;
  margin-top: 20px;
}

.left-section {
  position: relative;
  width: 30%;
  padding: 15px;
  height: 85vh;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.right-section {
  width: 75%;
  height: 85vh;
  padding: 15px;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

h1 {
  text-align: center;
}

.score-list {
  position: absolute;  /* 相对于上级容器定位 */
  left: 50%;            /* 水平居中 */
  transform: translateX(-50%);  /* 使按钮完全居中 */
  width: 100%;
  text-align: center;
  max-height: 80%; /* 设置容器的最大高度 */
  overflow-y: auto;  /* 如果内容超出，允许垂直滚动 */
}

.score-item {
  margin-bottom: 20px;
}

.score-buttons button{
  width: 15%;
  margin: 5px;
}

button {
  padding: 10px 20px;
  font-size: 16px;
  border: 1px solid #ccc;
  cursor: pointer;
  border-radius: 5px;
}

button.active {
  background-color: #4CAF50;
  color: white;
}

button:hover {
  background-color: #45a049;
}

button:active {
  transform: scale(0.95);
}

button:disabled {
  background-color: #ddd;
  cursor: not-allowed;
}

.save-button {
  position: absolute;  /* 相对于上级容器定位 */
  left: 50%;            /* 水平居中 */
  bottom: 25px;         /* 距离容器底部 20px */
  transform: translateX(-50%);  /* 使按钮完全居中 */
  padding: 10px 20px;
  background-color: #4CAF50;
  color: white;
  border: none;
  font-size: 16px;
  border-radius: 5px;
  cursor: pointer;
}

.save-button:hover {
  background-color: #45a049;
}

.back-button {
  padding: 10px 20px;
  background-color: #007BFF;
  color: white;
  border: none;
  cursor: pointer;
  border-radius: 5px;
  margin-bottom: 20px;
}
</style>
