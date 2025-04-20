<template>
  <div class="evaluation-management">
    <h1>评估管理</h1>

    <div>
      <button @click="goToAddEvaluationPage">添加评估</button>
      <button @click="openFilePicker">上传评估</button>
    </div>

    <div v-if="evaluations.length > 0" class="table-container">
      <table>
        <thead>
        <tr>
          <th>姓名</th>
          <th v-for="n in 10" :key="'score' + n">维度 {{ n }}</th>
          <th>总分</th>
          <th>评估等级</th>
          <th>操作</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(evaluation, index) in evaluations" :key="evaluation.name">
          <td>{{ evaluation.name }}</td>
          <td v-for="n in 10" :key="'score' + n">{{ evaluation[`score${n}`] }}</td>
          <td>{{ evaluation.total }}</td>
          <td>{{ evaluation.level }}</td>
          <td>
            <button @click="goToDetailPage(evaluation)">详情</button>
            <button @click="confirmDelete(index, evaluation.name)">删除</button>
          </td>
        </tr>
        </tbody>
      </table>
    </div>

    <!-- 删除确认弹窗 -->
    <div v-if="showDeleteConfirm" class="delete-confirm-modal">
      <div class="modal-content">
        <p>确定删除：{{ selectedEvaluationName }} 吗？</p>
        <button @click="deleteEvaluation" class="confirm-btn">确认删除</button>
        <button @click="cancelDelete" class="cancel-btn">取消</button>
      </div>
    </div>

    <!-- 文件选择弹窗 -->
    <div v-if="showUploadModal" class="upload-modal-overlay">
      <div class="upload-modal">
        <h3>选择评估文件</h3>
        <input type="file" @change="handleFileChange" />
        <button @click="cancelUpload">取消</button>
        <button @click="submitFile">上传</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

export default {
  name: 'EvaluationManagement',
  setup() {
    const evaluations = ref([]); // 用来存储评估对象数据
    const showDeleteConfirm = ref(false); // 删除确认弹窗
    const selectedEvaluationIndex = ref(null); // 被选中的评估对象
    const selectedEvaluationName = ref(''); // 被选中的评估对象名称
    const router = useRouter(); // 用于路由跳转
    const showUploadModal = ref(false);  // 控制文件选择弹窗的显示
    const selectedFile = ref(null);  // 存储用户选择的文件

    // 获取评估数据
    const getEvaluations = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const response = await axios.get('http://127.0.0.1:8000/evaluations', {
            headers: { 'Authorization': `Bearer ${token}` },
          });
          if (response.data.status_code === 200) {
            evaluations.value = response.data.data;  // 存储返回的评估数据
          }
        } catch (error) {
          console.error('获取评估数据失败:', error);
        }
      } else {
        console.log('用户未登录');
      }
    };

    // 在组件挂载时获取评估数据
    onMounted(() => {
      getEvaluations();
    });

    // 跳转到添加评估页面
    const goToAddEvaluationPage = () => {
      router.push('/add-evaluation');
    };

    // 打开文件选择弹窗
    const openFilePicker = () => {
      showUploadModal.value = true;
    };

    // 关闭文件选择弹窗
    const cancelUpload = () => {
      showUploadModal.value = false;
      selectedFile.value = null;  // 清空已选择的文件
    };

    // 处理文件选择事件
    const handleFileChange = (event) => {
      const file = event.target.files[0];  // 获取用户选择的第一个文件
      if (file) {
        selectedFile.value = file;  // 保存文件
      }
    };

    // 提交文件进行上传
    const submitFile = async () => {
      if (!selectedFile.value) {
        alert('请先选择一个文件');
        return;
      }

      // 创建 FormData 对象
      const formData = new FormData();
      formData.append('file', selectedFile.value);

      const token = localStorage.getItem('access_token');
      // 发送 POST 请求上传文件
      // 设置请求头
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        }
      };
      try {
        const response = await axios.post('http://127.0.0.1:8000/upload_excel', formData, config);
        console.log('上传成功:', response.data);
        alert('上传成功');
        showUploadModal.value = false;  // 关闭弹窗
      } catch (error) {
        console.error('上传失败:', error);
        alert('上传失败，请重试');
      }
    };

    // 跳转到评估对象详情页
    const goToDetailPage = (evaluation) => {
      router.push(`/evaluation-detail/${evaluation.name}`);
    };

    // 显示删除确认弹窗
    const confirmDelete = (index, name) => {
      selectedEvaluationName.value = name;  // 确保设置了评估对象名称
      selectedEvaluationIndex.value = index; // 存储当前选中的评估对象的索引
      showDeleteConfirm.value = true; // 显示删除确认弹窗
    };


    // 取消删除
    const cancelDelete = () => {
      showDeleteConfirm.value = false;
    };

    // 删除评估对象
    const deleteEvaluation = async () => {
      const name = selectedEvaluationName.value;  // 获取选中的评估对象名称
      if (!name) {
        alert('评估对象名称未定义'); // 如果没有获取到 name，弹出提示
        return; // 防止发送请求
      }

      // 对 name 进行 URL 编码
      const encodedName = encodeURIComponent(name);

      const token = localStorage.getItem('access_token');

      try {
        // 发送 DELETE 请求
        const response = await axios.delete(`http://127.0.0.1:8000/evaluation?name=${encodedName}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.status === 200) {
          evaluations.value.splice(selectedEvaluationIndex.value, 1);  // 从数组中删除评估对象
          showDeleteConfirm.value = false;
          alert('删除成功！');
        } else {
          alert('删除失败！');
        }
      } catch (error) {
        console.error('删除失败:', error);
        alert('删除失败，请稍后再试！');
      }
    };

    return {
      selectedEvaluationName,
      selectedEvaluationIndex,
      evaluations,
      showDeleteConfirm,
      showUploadModal,
      selectedFile,
      goToAddEvaluationPage,
      openFilePicker,
      cancelUpload,
      handleFileChange,
      submitFile,
      goToDetailPage,
      confirmDelete,
      cancelDelete,
      deleteEvaluation,
    };
  },
};
</script>

<style scoped>
.evaluation-management {
  text-align: center;
  margin-top: 20px;
}

/* 容器最大宽度，保持页面在大屏幕下居中 */
.table-container {
  display: flex;
  justify-content: center;
  width: 100%;
  margin-top: 20px;
}

/* 表格样式 */
table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 12px;
  text-align: center;
  border: 1px solid #ddd;
}

th {
  background-color: #4CAF50;
  color: white;
}

button {
  padding: 10px 20px;
  background-color: #4CAF50;
  color: white;
  border: none;
  cursor: pointer;
  margin: 10px;
}

button:hover {
  background-color: #45a049;
}

.delete-confirm-modal {
  background-color: rgba(0, 0, 0, 0.6);  /* 背景半透明 */
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.delete-confirm-modal .modal-content {
  background-color: #fff;
  padding: 20px;
  border-radius: 10px;
  width: 400px;
  text-align: center;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.delete-confirm-modal p {
  font-size: 16px;
  color: #333;
  margin-bottom: 20px;
}

.delete-confirm-modal button {
  padding: 10px 20px;
  font-size: 16px;
  border: none;
  cursor: pointer;
  border-radius: 5px;
  margin: 5px;
}

.delete-confirm-modal .confirm-btn {
  background-color: #4CAF50;
  color: white;
}

.delete-confirm-modal .cancel-btn {
  background-color: #f44336;
  color: white;
}

.delete-confirm-modal button:hover {
  opacity: 0.8;
}
/* 弹窗的灰色半透明背景 */
.upload-modal-overlay {
  background-color: rgba(0, 0, 0, 0.5);  /* 半透明背景 */
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

/* 弹窗的内容样式 */
.upload-modal {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  width: 400px;
  text-align: center;
}

.upload-modal h3 {
  margin-bottom: 20px;
  font-size: 18px;
  color: #333;
}

.upload-modal input[type="file"] {
  margin-bottom: 20px;
  padding: 10px;
  width: 100%;
}

button {
  padding: 10px 20px;
  font-size: 16px;
  border: none;
  cursor: pointer;
  border-radius: 5px;
  margin: 5px;
}

button:hover {
  opacity: 0.8;
}

button.cancel {
  background-color: #f44336;
  color: white;
}

button.confirm {
  background-color: #4CAF50;
  color: white;
}
</style>
