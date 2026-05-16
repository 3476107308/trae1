const apiConfig = require('../../config/api.js');

Page({
  data: {
    trendData: [],
    todayCompleted: 0,
    averageCompleted: 0,
    summary: ''
  },

  onLoad: function() {
    this.loadTrendData();
  },

  loadTrendData: function() {
    wx.request({
      url: `${apiConfig.baseUrl}/completed-trend.php`,
      method: 'GET',
      data: {
        days: 7
      },
      success: (res) => {
        if (res.data.success) {
          const data = res.data.data;
          let total = 0;
          let todayCount = 0;
          
          data.forEach((item, index) => {
            total += item.completedCount;
            if (index === data.length - 1) {
              todayCount = item.completedCount;
            }
            item.dayLabel = this.getDayLabel(item.date);
          });

          const average = data.length > 0 ? Math.round(total / data.length * 10) / 10 : 0;
          
          let summary = '';
          if (todayCount === 0) {
            summary = '今天还没有完成任何事项，加油！';
          } else if (todayCount > average) {
            summary = `今天完成 ${todayCount} 项，高于最近7天平均水平`;
          } else if (todayCount === average) {
            summary = `今天完成 ${todayCount} 项，与最近7天平均持平`;
          } else {
            summary = `今天完成 ${todayCount} 项，继续努力！`;
          }

          this.setData({
            trendData: data,
            todayCompleted: todayCount,
            averageCompleted: average,
            summary: summary
          }, () => {
            this.drawLineChart();
          });
        }
      },
      fail: () => {
        this.setData({
          summary: '无法获取数据，请检查服务器连接'
        });
      }
    });
  },

  drawLineChart: function() {
    const query = wx.createSelectorQuery();
    query.select('.line-canvas')
      .fields({ node: true, size: true })
      .exec((res) => {
        if (!res[0] || !res[0].node || this.data.trendData.length === 0) return;

        const canvas = res[0].node;
        const ctx = canvas.getContext('2d');
        const dpr = wx.getSystemInfoSync().pixelRatio;
        const rect = res[0];

        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);

        const padding = 30;
        const chartWidth = rect.width - padding * 2;
        const chartHeight = rect.height - padding * 2;
        const points = this.data.trendData;
        const maxCount = this.getMaxCount();

        if (maxCount === 0) {
          ctx.fillStyle = '#999';
          ctx.font = '14px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('暂无数据', rect.width / 2, rect.height / 2);
          return;
        }

        const totalWidth = rect.width;
        const itemWidth = totalWidth / points.length;
        const coords = points.map((item, index) => ({
          x: (index + 0.5) * itemWidth,
          y: padding + chartHeight - (item.completedCount / maxCount) * chartHeight
        }));

        if (points.length > 1) {
          ctx.beginPath();
          ctx.moveTo(coords[0].x, coords[0].y);
          for (let i = 1; i < coords.length; i++) {
            ctx.lineTo(coords[i].x, coords[i].y);
          }
          ctx.strokeStyle = '#4a90e2';
          ctx.lineWidth = 3;
          ctx.lineJoin = 'round';
          ctx.stroke();

          const gradient = ctx.createLinearGradient(0, padding, 0, padding + chartHeight);
          gradient.addColorStop(0, 'rgba(74,144,226,0.2)');
          gradient.addColorStop(1, 'rgba(74,144,226,0)');
          ctx.lineTo(coords[coords.length - 1].x, padding + chartHeight);
          ctx.lineTo(coords[0].x, padding + chartHeight);
          ctx.closePath();
          ctx.fillStyle = gradient;
          ctx.fill();
        }

        coords.forEach((coord, index) => {
          ctx.beginPath();
          ctx.arc(coord.x, coord.y, 6, 0, 2 * Math.PI);
          ctx.fillStyle = '#4a90e2';
          ctx.fill();
          ctx.beginPath();
          ctx.arc(coord.x, coord.y, 6, 0, 2 * Math.PI);
          ctx.strokeStyle = '#fff';
          ctx.lineWidth = 3;
          ctx.stroke();
          
          ctx.fillStyle = '#4a90e2';
          ctx.font = 'bold 12px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(points[index].completedCount.toString(), coord.x, coord.y - 12);
        });
      });
  },

  getDayLabel: function(dateStr) {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (dateStr === this.formatDate(today)) {
      return '今天';
    } else if (dateStr === this.formatDate(yesterday)) {
      return '昨天';
    } else {
      return `${date.getMonth() + 1}/${date.getDate()}`;
    }
  },

  formatDate: function(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  getMaxCount: function() {
    let max = 1;
    this.data.trendData.forEach(item => {
      if (item.completedCount > max) {
        max = item.completedCount;
      }
    });
    return max;
  },

  getBarHeight: function(count) {
    const max = this.getMaxCount();
    if (max === 0) return 0;
    return (count / max) * 100;
  },

  goBack: function() {
    wx.navigateBack();
  }
})