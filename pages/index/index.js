// index.js
Page({
  data: {
    userInfo: {
      name: '卡皮巴拉',
      title: '前端理发师',
      phone: 'mywechat',
      email: 'don_t@capibala.com',
      address: '忘了我家在哪了',
      skills: ['吃', '睡', '走神'],
      hobbies: ['走神', '睡', '吃'],
      about: '这个人很懒，什么介绍也没留下。',
      avatarUrl: '/images/avatar.png'
    }
  },

  onLoad() {
    // 初始化时，如果本地存储没有数据，将默认数据保存到本地存储
    const storedUserInfo = wx.getStorageSync('userInfo');
    if (!storedUserInfo) {
      wx.setStorageSync('userInfo', this.data.userInfo);
    }
    this.loadUserInfo();
  },

  onShow() {
    this.loadUserInfo();
  },

  loadUserInfo() {
    const storedUserInfo = wx.getStorageSync('userInfo');
    if (storedUserInfo) {
      this.setData({
        userInfo: storedUserInfo
      });
    }
  },

  copyText(event) {
    // 添加轻微震动
    wx.vibrateShort({
      type: 'light'
    });
    
    const { type } = event.currentTarget.dataset;
    const text = this.data.userInfo[type];
    wx.setClipboardData({
      data: text,
      success: () => {
        wx.showToast({
          title: '复制成功',
          icon: 'success'
        });
      }
    });
  },

  goToEdit() {
    // 添加轻微震动
    wx.vibrateShort({
      type: 'light'
    });
    
    wx.navigateTo({
      url: '/pages/edit/edit'
    });
  }
});
