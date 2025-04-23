// index.js
Page({
  data: {
    userInfo: {
      name: 'Jerry',
      title: '后端开发工程师',
      phone: '138****8888',
      email: 'example@email.com',
      address: '北京市朝阳区',
      skills: ['HTML5', 'CSS3', 'JavaScript', 'Vue', 'Node.js', 'MySQL'],
      hobbies: ['单板滑雪', '阅读', '乒乓球', '跑步', '共学'],
      about: '热爱编程，专注于后端开发，擅长Node.js和数据库设计。喜欢研究新技术，乐于分享技术经验。'
    }
  },

  onLoad() {
    this.loadUserInfo();
  },

  onShow() {
    this.loadUserInfo();
  },

  loadUserInfo() {
    const storedUserInfo = wx.getStorageSync('userInfo');
    if (storedUserInfo) {
      this.setData({
        userInfo: {
          ...this.data.userInfo,
          ...storedUserInfo
        }
      });
    }
  },

  copyPhoneNumber() {
    wx.setClipboardData({
      data: this.data.userInfo.phone,
      success: () => {
        wx.showToast({
          title: '复制成功',
          icon: 'success'
        });
      }
    });
  },

  goToEdit() {
    wx.navigateTo({
      url: '/pages/edit/edit'
    });
  }
});
