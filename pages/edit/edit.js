Page({
  data: {
    name: '',
    title: '',
    phone: '',
    email: '',
    address: '',
    skills: [],
    hobbies: [],
    newSkill: '',
    newHobby: '',
    about: '',
    avatarUrl: '',
    isNewImageSelected: false // 添加标记，表示是否选择了新图片
  },

  onLoad() {
    // 从本地存储加载数据
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.setData({
        name: userInfo.name || '',
        title: userInfo.title || '',
        phone: userInfo.phone || '',
        email: userInfo.email || '',
        address: userInfo.address || '',
        skills: userInfo.skills || [],
        hobbies: userInfo.hobbies || [],
        about: userInfo.about || '',
        avatarUrl: userInfo.avatarUrl || ''
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

  // 选择头像
  chooseAvatar() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFilePaths[0];
        this.setData({
          avatarUrl: tempFilePath,
          isNewImageSelected: true // 标记已选择新图片
        });
      }
    });
  },

  // 保存图片到本地
  saveImageToLocal() {
    return new Promise((resolve, reject) => {
      if (!this.data.isNewImageSelected) {
        // 如果没有选择新图片，直接返回当前的avatarUrl
        resolve(this.data.avatarUrl);
        return;
      }

      const tempFilePath = this.data.avatarUrl;
      // 生成文件名，使用时间戳确保唯一性
      const fileName = `avatar_${Date.now()}.jpg`;
      // 保存到本地用户文件夹中
      wx.saveFile({
        tempFilePath: tempFilePath,
        success: (res) => {
          console.log('图片保存成功，永久路径：', res.savedFilePath);
          resolve(res.savedFilePath);
        },
        fail: (err) => {
          console.error('保存图片失败：', err);
          reject(err);
        }
      });
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

  // 更新全局数据和本地存储
  updateGlobalData(savedImagePath) {
    return new Promise((resolve, reject) => {
      try {
        const userInfo = {
          name: this.data.name,
          title: this.data.title,
          phone: this.data.phone,
          email: this.data.email,
          address: this.data.address,
          skills: this.data.skills,
          hobbies: this.data.hobbies,
          about: this.data.about,
          avatarUrl: savedImagePath
        };

        // 更新本地存储
        wx.setStorageSync('userInfo', userInfo);
        console.log('本地存储更新成功，新的用户信息：', userInfo);

        // 获取页面栈并更新首页数据
        const pages = getCurrentPages();
        const prevPage = pages[pages.length - 2];
        if (prevPage) {
          prevPage.setData({
            userInfo: userInfo
          }, () => {
            console.log('首页数据更新成功');
            resolve();
          });
        } else {
          resolve();
        }
      } catch (err) {
        console.error('更新数据失败：', err);
        reject(err);
      }
    });
  },

  // 保存修改
  saveChanges() {
    wx.showLoading({
      title: '保存中...',
      mask: true
    });

    // 1. 先保存图片到本地
    this.saveImageToLocal()
      .then(savedImagePath => {
        console.log('开始更新全局数据，使用新的图片路径：', savedImagePath);
        // 2. 更新全局数据和本地存储
        return this.updateGlobalData(savedImagePath);
      })
      .then(() => {
        // 3. 隐藏加载提示
        wx.hideLoading();
        // 4. 返回上一页
        wx.navigateBack({
          complete: () => {
            wx.showToast({
              title: '保存成功',
              icon: 'success',
              duration: 1500
            });
          }
        });
      })
      .catch(err => {
        console.error('保存过程出错：', err);
        wx.hideLoading();
        wx.showToast({
          title: '保存失败',
          icon: 'error',
          duration: 1500
        });
      });
  }
}); 