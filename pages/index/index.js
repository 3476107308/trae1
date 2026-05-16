const apiConfig = require('../../config/api.js');

Page({
  data: {
    todoList: [],
    inputValue: '',
    currentDate: '',
    pendingTodos: [],
    completedTodos: [],
    isLoading: false,
    showDetailPanel: false,
    editingId: null,
    detailTitle: '',
    detailDescription: '',
    detailDate: 'today',
    detailCategory: 'unclassified',
    detailPriority: 'P2',
    viewMode: 'day',
    weekStart: '',
    weekEnd: '',
    weekTodos: [],
    detailSubtasks: [],
    showSubtaskInput: false,
    subtaskInputValue: '',
    completedSubtaskCount: 0
  },

  onLoad: function(options) {
    const today = new Date();
    const defaultDate = this.formatDate(today);
    const currentDate = options && options.date ? options.date : defaultDate;
    this.setData({
      currentDate: currentDate
    });
    this.loadTodos();
    console.log('首页加载完成');
  },

  onShow: function() {
    this.loadTodos();
  },

  formatDate: function(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  loadTodos: function() {
    this.setData({ isLoading: true });
    
    wx.request({
      url: `${apiConfig.baseUrl}/list.php`,
      method: 'GET',
      data: {
        date: this.data.currentDate
      },
      timeout: 10000,
      success: (res) => {
        this.setData({ isLoading: false });
        if (res.data && res.data.success) {
          var oldMap = {};
          this.data.todoList.forEach(function(item) {
            if (item.subtasks && item.subtasks.length > 0) {
              oldMap[item.id] = item.subtasks;
            }
          });
          const todos = res.data.data.map(item => ({
            id: item.id,
            title: item.title,
            description: item.description || '',
            category: item.category || 'unclassified',
            completed: item.completed == 1,
            date: item.date,
            subtasks: oldMap[item.id] || item.subtasks || []
          }));
          this.setData({
            todoList: todos
          });
          this.filterTodos();
        } else {
          wx.showToast({
            title: '加载失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        this.setData({ isLoading: false });
        console.log('loadTodos 请求失败', err);
        wx.showToast({
          title: '本地服务器连接失败',
          icon: 'none',
          duration: 2000
        });
      }
    });
  },

  filterTodos: function() {
    const currentDateItems = this.data.todoList.filter(item => item.date === this.data.currentDate);
    const priorityOrder = { 'P1': 0, 'P2': 1, 'P3': 2 };
    const pendingTodos = currentDateItems.filter(item => !item.completed).sort((a, b) => {
      return (priorityOrder[a.priority || 'P2'] || 1) - (priorityOrder[b.priority || 'P2'] || 1);
    });
    const completedTodos = currentDateItems.filter(item => item.completed).sort((a, b) => {
      return (priorityOrder[a.priority || 'P2'] || 1) - (priorityOrder[b.priority || 'P2'] || 1);
    });
    this.setData({
      pendingTodos: pendingTodos,
      completedTodos: completedTodos
    });
  },

  goToTrend: function() {
    wx.navigateTo({
      url: '/pages/trend/trend'
    });
  },

  goToSummary: function() {
    wx.navigateTo({
      url: '/pages/summary/summary'
    });
  },

  goToProfile: function() {
    wx.navigateTo({
      url: '/pages/profile/profile'
    });
  },

  handleInput: function(e) {
    this.setData({
      inputValue: e.detail.value
    });
  },

  addTodo: function() {
    const inputValue = this.data.inputValue.trim();
    this.setData({
      showDetailPanel: true,
      editingId: null,
      detailTitle: inputValue,
      detailDescription: '',
      detailDate: 'today',
      detailCategory: 'unclassified',
      detailPriority: 'P2',
      detailSubtasks: [],
      showSubtaskInput: false,
      subtaskInputValue: '',
      completedSubtaskCount: 0
    });
  },

  editTodo: function(e) {
    const id = e.currentTarget.dataset.id;
    const todo = this.data.todoList.find(item => item.id === id);
    if (todo) {
      const today = this.formatDate(new Date());
      const isToday = todo.date === today;
      const localSubtasks = (todo.subtasks || []).map(sub => ({
        id: sub.id,
        todo_id: id,
        title: sub.title,
        completed: sub.completed || 0
      }));

      this.setData({
        showDetailPanel: true,
        editingId: id,
        detailTitle: todo.title || '',
        detailDescription: todo.description || '',
        detailDate: isToday ? 'today' : 'tomorrow',
        detailCategory: todo.category || 'unclassified',
        detailPriority: todo.priority || 'P2',
        detailSubtasks: localSubtasks,
        showSubtaskInput: false,
        subtaskInputValue: ''
      }, () => {
        this.updateCompletedSubtaskCount();
      });
    }
  },

  handleDetailTitleInput: function(e) {
    this.setData({
      detailTitle: e.detail.value
    });
  },

  handleDetailDescriptionInput: function(e) {
    this.setData({
      detailDescription: e.detail.value
    });
  },

  selectDetailDate: function(e) {
    const value = e.currentTarget.dataset.value;
    this.setData({
      detailDate: value
    });
  },

  selectDetailCategory: function(e) {
    const value = e.currentTarget.dataset.value;
    this.setData({
      detailCategory: value
    });
  },

  selectDetailPriority: function(e) {
    const value = e.currentTarget.dataset.value;
    this.setData({
      detailPriority: value
    });
  },

  closeDetailPanel: function() {
    this.setData({
      showDetailPanel: false,
      editingId: null,
      detailSubtasks: [],
      showSubtaskInput: false,
      subtaskInputValue: '',
      completedSubtaskCount: 0
    });
  },

  saveDetailTodo: function() {
    const title = this.data.detailTitle.trim();
    if (!title) {
      wx.showToast({
        title: '请输入事项标题',
        icon: 'none'
      });
      return;
    }

    let targetDate = this.data.currentDate;
    if (this.data.detailDate === 'tomorrow') {
      const tomorrow = new Date(this.data.currentDate);
      tomorrow.setDate(tomorrow.getDate() + 1);
      targetDate = this.formatDate(tomorrow);
    }

    let todoList;
    let successMsg;

    if (this.data.editingId !== null) {
      todoList = this.data.todoList.map(item => {
        if (item.id === this.data.editingId) {
          return {
            ...item,
            title: title,
            description: this.data.detailDescription,
            date: targetDate,
            category: this.data.detailCategory,
            priority: this.data.detailPriority,
            subtasks: this.data.detailSubtasks
          };
        }
        return item;
      });
      successMsg = '保存成功';
    } else {
      const newTodo = {
        id: Date.now(),
        title: title,
        description: this.data.detailDescription,
        date: targetDate,
        category: this.data.detailCategory,
        priority: this.data.detailPriority,
        completed: false,
        subtasks: this.data.detailSubtasks.map(sub => ({
          id: sub.id,
          title: sub.title,
          completed: sub.completed
        }))
      };
      todoList = [...this.data.todoList, newTodo];
      successMsg = '添加成功';
    }

    this.setData({
      todoList: todoList,
      inputValue: '',
      showDetailPanel: false,
      editingId: null,
      detailTitle: '',
      detailDescription: '',
      detailSubtasks: [],
      showSubtaskInput: false,
      subtaskInputValue: '',
      completedSubtaskCount: 0
    });
    this.filterTodos();
    wx.showToast({
      title: successMsg,
      icon: 'success'
    });
  },

  toggleTodo: function(e) {
    const id = e.currentTarget.dataset.id;
    
    wx.request({
      url: `${apiConfig.baseUrl}/toggle.php`,
      method: 'POST',
      data: {
        id: id
      },
      success: (res) => {
        if (res.data.success) {
          const todoList = this.data.todoList.map(item => {
            if (item.id === id) {
              return { ...item, completed: !item.completed };
            }
            return item;
          });
          this.setData({
            todoList: todoList
          });
          this.filterTodos();
        } else {
          wx.showToast({
            title: '更新失败',
            icon: 'none'
          });
        }
      },
      fail: () => {
        wx.showToast({
          title: '本地服务器连接失败',
          icon: 'none',
          duration: 2000
        });
      }
    });
  },

  prevDay: function() {
    const currentDate = new Date(this.data.currentDate);
    currentDate.setDate(currentDate.getDate() - 1);
    this.setData({
      currentDate: this.formatDate(currentDate)
    });
    this.loadTodos();
  },

  nextDay: function() {
    const currentDate = new Date(this.data.currentDate);
    currentDate.setDate(currentDate.getDate() + 1);
    this.setData({
      currentDate: this.formatDate(currentDate)
    });
    this.loadTodos();
  },

  today: function() {
    const today = new Date();
    if (this.data.viewMode === 'week') {
      const dayOfWeek = today.getDay();
      const startDate = new Date(today);
      startDate.setDate(today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1));
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      
      this.setData({
        weekStart: this.formatDate(startDate),
        weekEnd: this.formatDate(endDate),
        currentDate: this.formatDate(today)
      }, () => {
        this.loadWeekTodos();
      });
    } else {
      this.setData({
        currentDate: this.formatDate(today)
      }, () => {
        this.loadTodos();
      });
    }
  },

  switchToDayMode: function() {
    this.setData({
      viewMode: 'day'
    });
    this.loadTodos();
  },

  switchToWeekMode: function() {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1));
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    
    const weekStart = this.formatDate(startDate);
    const weekEnd = this.formatDate(endDate);
    
    this.setData({
      viewMode: 'week',
      weekStart: weekStart,
      weekEnd: weekEnd,
      currentDate: this.formatDate(today)
    }, () => {
      this.loadWeekTodos();
    });
  },

  calculateWeekRange: function(date) {
    const dayOfWeek = date.getDay();
    const startDate = new Date(date);
    startDate.setDate(date.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1));
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    
    this.setData({
      weekStart: this.formatDate(startDate),
      weekEnd: this.formatDate(endDate),
      currentDate: this.formatDate(date)
    });
  },

  prevWeek: function() {
    const startDate = new Date(this.data.weekStart);
    startDate.setDate(startDate.getDate() - 7);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    
    this.setData({
      weekStart: this.formatDate(startDate),
      weekEnd: this.formatDate(endDate)
    }, () => {
      this.loadWeekTodos();
    });
  },

  nextWeek: function() {
    const startDate = new Date(this.data.weekStart);
    startDate.setDate(startDate.getDate() + 7);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    
    this.setData({
      weekStart: this.formatDate(startDate),
      weekEnd: this.formatDate(endDate)
    }, () => {
      this.loadWeekTodos();
    });
  },

  loadWeekTodos: function() {
    this.setData({ isLoading: true });

    wx.request({
      url: `${apiConfig.baseUrl}/list.php`,
      method: 'GET',
      timeout: 10000,
      success: (res) => {
        this.setData({ isLoading: false });
        if (res.data && res.data.success) {
          const weekStart = this.data.weekStart;
          const weekEnd = this.data.weekEnd;
          var oldMap = {};
          this.data.todoList.forEach(function(item) {
            if (item.subtasks && item.subtasks.length > 0) {
              oldMap[item.id] = item.subtasks;
            }
          });
          const todos = res.data.data
            .filter(item => item.date >= weekStart && item.date <= weekEnd)
            .map(item => ({
              id: item.id,
              title: item.title,
              description: item.description || '',
              category: item.category || 'unclassified',
              completed: item.completed == 1,
              date: item.date,
              subtasks: oldMap[item.id] || item.subtasks || []
            }));
          this.setData({ todoList: todos });
          this.groupTodosByDate();
        } else {
          wx.showToast({
            title: '加载失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        this.setData({ isLoading: false });
        console.log('loadWeekTodos 请求失败', err);
        wx.showToast({
          title: '本地服务器连接失败',
          icon: 'none',
          duration: 2000
        });
        this.groupTodosByDate();
      }
    });
  },

  groupTodosByDate: function() {
    const weekTodos = [];
    const dayLabels = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    
    const startDate = new Date(this.data.weekStart);
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      const dateStr = this.formatDate(date);
      const dayLabel = dayLabels[date.getDay()];
      
      const dayTodos = this.data.todoList.filter(item => item.date === dateStr);
      const pending = dayTodos.filter(item => !item.completed);
      const completed = dayTodos.filter(item => item.completed);
      
      weekTodos.push({
        date: dateStr,
        dayLabel: dayLabel,
        pending: pending,
        completed: completed
      });
    }
    
    this.setData({
      weekTodos: weekTodos
    });
  },

  goToDayView: function(e) {
    const date = e.currentTarget.dataset.date;
    this.setData({
      viewMode: 'day',
      currentDate: date
    });
    this.loadTodos();
  },

  loadSubtasks: function(todoId) {
    wx.request({
      url: `${apiConfig.baseUrl}/subtasks.php`,
      method: 'GET',
      data: {
        todo_id: todoId
      },
      timeout: 10000,
      success: (res) => {
        if (res.data.success) {
          const subtasks = res.data.data.map(item => ({
            id: item.id,
            todo_id: item.todo_id,
            title: item.title,
            completed: item.completed
          }));
          this.setData({
            detailSubtasks: subtasks
          });
          this.updateCompletedSubtaskCount();
        }
      },
      fail: () => {
        console.log('加载子任务失败');
      }
    });
  },

  showSubtaskInput: function() {
    this.setData({
      showSubtaskInput: true,
      subtaskInputValue: ''
    });
  },

  handleSubtaskInput: function(e) {
    this.setData({
      subtaskInputValue: e.detail.value
    });
  },

  addSubtask: function() {
    var title = this.data.subtaskInputValue.trim();
    if (!title) {
      wx.showToast({ title: '请输入子任务内容', icon: 'none' });
      return;
    }

    var subtask = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      todo_id: this.data.editingId || null,
      title: title,
      completed: 0
    };
    var detailSubtasks = this.data.detailSubtasks.concat(subtask);
    this.setData({
      detailSubtasks: detailSubtasks,
      subtaskInputValue: '',
      showSubtaskInput: false
    });
    this.updateCompletedSubtaskCount();
    wx.showToast({ title: '子任务已添加', icon: 'success', duration: 1000 });
  },

  toggleSubtask: function(e) {
    var id = e.currentTarget.dataset.id;
    var detailSubtasks = this.data.detailSubtasks.map(function(item) {
      if (item.id === id) {
        return { id: item.id, todo_id: item.todo_id, title: item.title, completed: item.completed == 1 ? 0 : 1 };
      }
      return item;
    });
    this.setData({ detailSubtasks: detailSubtasks });
    this.updateCompletedSubtaskCount();
  },

  deleteSubtask: function(e) {
    var id = e.currentTarget.dataset.id;
    var that = this;
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个子任务吗？',
      success: function(modalRes) {
        if (modalRes.confirm) {
          var detailSubtasks = that.data.detailSubtasks.filter(function(item) {
            return item.id !== id;
          });
          that.setData({ detailSubtasks: detailSubtasks });
          that.updateCompletedSubtaskCount();
        }
      }
    });
  },

  cancelSubtaskInput: function() {
    this.setData({
      showSubtaskInput: false,
      subtaskInputValue: ''
    });
  },

  updateCompletedSubtaskCount: function() {
    const count = this.data.detailSubtasks.filter(item => item.completed == 1).length;
    this.setData({
      completedSubtaskCount: count
    });
  }
})