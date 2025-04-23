Page({
  data: {
    name: 'Jerry',
    title: '后端开发工程师',
    phone: '138****8888',
    email: 'example@email.com',
    address: '北京市朝阳区',
    skills: ['HTML5', 'CSS3', 'JavaScript', 'Vue', 'Node.js', 'MySQL'],
    hobbies: ['单板滑雪', '阅读', '乒乓球', '跑步', '共学'],
    newSkill: '',
    newHobby: '',
    about: '热爱编程，专注于后端开发，擅长Node.js和数据库设计。喜欢研究新技术，乐于分享技术经验。'
  },

  onLoad() {
    // 从本地存储获取数据
    const userInfo = wx.getStorageSync('userInfo') || {};
    if (userInfo) {
      this.setData({
        name: userInfo.name || this.data.name,
        title: userInfo.title || this.data.title,
        phone: userInfo.phone || this.data.phone,
        email: userInfo.email || this.data.email,
        address: userInfo.address || this.data.address,
        skills: userInfo.skills || this.data.skills,
        hobbies: userInfo.hobbies || this.data.hobbies,
        about: userInfo.about || this.data.about
      });
    }
  },

  // 输入框内容变化
  onNameInput(e) {
    this.setData({
      name: e.detail.value
    });
  },

  onTitleInput(e) {
    this.setData({
      title: e.detail.value
    });
  },

  onPhoneInput(e) {
    this.setData({
      phone: e.detail.value
    });
  },

  onEmailInput(e) {
    this.setData({
      email: e.detail.value
    });
  },

  onAddressInput(e) {
    this.setData({
      address: e.detail.value
    });
  },

  onNewSkillInput(e) {
    this.setData({
      newSkill: e.detail.value
    });
  },

  onNewHobbyInput(e) {
    this.setData({
      newHobby: e.detail.value
    });
  },

  onAboutInput(e) {
    this.setData({
      about: e.detail.value
    });
  },

  // 添加新技能
  addSkill() {
    if (!this.data.newSkill.trim()) {
      wx.showToast({
        title: '请输入技能名称',
        icon: 'none'
      });
      return;
    }

    this.setData({
      skills: [...this.data.skills, this.data.newSkill],
      newSkill: ''
    });
  },

  // 删除技能
  deleteSkill(e) {
    const { index } = e.currentTarget.dataset;
    const skills = [...this.data.skills];
    skills.splice(index, 1);
    this.setData({ skills });
  },

  // 添加新爱好
  addHobby() {
    if (!this.data.newHobby.trim()) {
      wx.showToast({
        title: '请输入爱好名称',
        icon: 'none'
      });
      return;
    }

    this.setData({
      hobbies: [...this.data.hobbies, this.data.newHobby],
      newHobby: ''
    });
  },

  // 删除爱好
  deleteHobby(e) {
    const { index } = e.currentTarget.dataset;
    const hobbies = [...this.data.hobbies];
    hobbies.splice(index, 1);
    this.setData({ hobbies });
  },

  // 保存修改
  saveChanges() {
    const userInfo = {
      name: this.data.name,
      title: this.data.title,
      phone: this.data.phone,
      email: this.data.email,
      address: this.data.address,
      skills: this.data.skills,
      hobbies: this.data.hobbies,
      about: this.data.about
    };

    // 保存到本地存储
    wx.setStorageSync('userInfo', userInfo);

    // 获取页面栈
    const pages = getCurrentPages();
    // 获取上一页（首页）实例
    const prevPage = pages[pages.length - 2];
    
    // 更新首页数据
    if (prevPage) {
      prevPage.setData({
        userInfo: userInfo
      });
    }

    wx.showToast({
      title: '保存成功',
      icon: 'success',
      duration: 2000,
      success: () => {
        setTimeout(() => {
          wx.navigateBack();
        }, 2000);
      }
    });
  }
}); 