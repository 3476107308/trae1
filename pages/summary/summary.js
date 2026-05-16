const apiConfig = require('../../config/api.js');

Page({
  data: {
    currentYear: 2026,
    currentMonth: 5,
    calendarData: [],
    monthSummary: {}
  },

  onLoad: function(options) {
    const today = new Date();
    this.setData({
      currentYear: today.getFullYear(),
      currentMonth: today.getMonth() + 1
    });
    this.loadMonthSummary();
  },

  loadMonthSummary: function() {
    const month = `${this.data.currentYear}-${String(this.data.currentMonth).padStart(2, '0')}`;
    
    wx.request({
      url: `${apiConfig.baseUrl}/month-summary.php`,
      method: 'GET',
      data: {
        month: month
      },
      timeout: 10000,
      success: (res) => {
        if (res.data.success) {
          const summary = {};
          res.data.data.forEach(item => {
            summary[item.date] = {
              total: item.total,
              completed: item.completed
            };
          });
          this.setData({
            monthSummary: summary
          });
        }
        this.generateCalendar();
      },
      fail: () => {
        this.generateCalendar();
      }
    });
  },

  generateCalendar: function() {
    const year = this.data.currentYear;
    const month = this.data.currentMonth;
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const daysInMonth = lastDay.getDate();
    const startWeekDay = firstDay.getDay();

    const calendarData = [];
    let week = [];

    for (let i = 0; i < startWeekDay; i++) {
      week.push({ day: 0, hasTodo: false });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const summary = this.data.monthSummary[date];
      
      week.push({
        day: day,
        date: date,
        hasTodo: summary && summary.total > 0,
        total: summary ? summary.total : 0,
        completed: summary ? summary.completed : 0
      });

      if (week.length === 7) {
        calendarData.push(week);
        week = [];
      }
    }

    if (week.length > 0) {
      while (week.length < 7) {
        week.push({ day: 0, hasTodo: false });
      }
      calendarData.push(week);
    }

    this.setData({
      calendarData: calendarData
    });
  },

  prevMonth: function() {
    let year = this.data.currentYear;
    let month = this.data.currentMonth;
    
    month--;
    if (month < 1) {
      month = 12;
      year--;
    }
    
    this.setData({
      currentYear: year,
      currentMonth: month
    });
    this.loadMonthSummary();
  },

  nextMonth: function() {
    let year = this.data.currentYear;
    let month = this.data.currentMonth;
    
    month++;
    if (month > 12) {
      month = 1;
      year++;
    }
    
    this.setData({
      currentYear: year,
      currentMonth: month
    });
    this.loadMonthSummary();
  },

  selectDate: function(e) {
    const date = e.currentTarget.dataset.date;
    if (date) {
      wx.navigateTo({
        url: `/pages/index/index?date=${date}`
      });
    }
  },

  goBack: function() {
    wx.navigateBack();
  }
})