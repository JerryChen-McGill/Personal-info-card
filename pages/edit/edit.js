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
    isNewImageSelected: false, // 添加标记，表示是否选择了新图片
    customBlocks: [], // 存储自定义块的数组
    containerHeight: 'calc(100vh + 1200rpx)', // 初始容器高度
    scrollAreaPadding: '720rpx',  // 初始底部padding
    sectionHidden: {} // 存储各个区域的隐藏状态
  },

  // 计算容器高度和底部padding
  calculateHeight() {
    const baseHeight = 1200 // 基础内容高度
    const customBlockHeight = 466 // 每个自定义块的精确高度
    const basePadding = 720 // 基础底部padding
    const blockPadding = 50 // 每个块额外需要的padding调整值
    
    const totalHeight = baseHeight + (this.data.customBlocks.length * customBlockHeight)
    const totalPadding = basePadding + (this.data.customBlocks.length * blockPadding)
    
    return {
      containerHeight: `calc(100vh + ${totalHeight}rpx)`,
      scrollAreaPadding: `${totalPadding}rpx`
    }
  },

  // 更新容器高度
  updateContainerHeight() {
    const { containerHeight, scrollAreaPadding } = this.calculateHeight()
    this.setData({
      containerHeight,
      scrollAreaPadding
    })
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
        avatarUrl: userInfo.avatarUrl || '',
        customBlocks: userInfo.customBlocks || [], // 加载自定义块数据
        sectionHidden: userInfo.sectionHidden || {} // 加载隐藏状态数据
      }, () => {
        // 加载完数据后更新容器高度
        this.updateContainerHeight()
      });
    }
  },

  // 切换区域的隐藏/显示状态
  toggleSectionVisibility(e) {
    // 添加轻微震动
    wx.vibrateShort({
      type: 'light'
    });

    const section = e.currentTarget.dataset.section;
    const sectionHidden = { ...this.data.sectionHidden };
    
    // 切换状态
    sectionHidden[section] = !sectionHidden[section];
    
    this.setData({
      sectionHidden
    });
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
    // 添加轻微震动
    wx.vibrateShort({
      type: 'light'
    });
    
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
    // 添加轻微震动
    wx.vibrateShort({
      type: 'light'
    });
    
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
    // 添加轻微震动
    wx.vibrateShort({
      type: 'light'
    });
    
    const { index } = e.currentTarget.dataset;
    const skills = [...this.data.skills];
    skills.splice(index, 1);
    this.setData({ skills });
  },

  // 添加新爱好
  addHobby() {
    // 添加轻微震动
    wx.vibrateShort({
      type: 'light'
    });
    
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
    // 添加轻微震动
    wx.vibrateShort({
      type: 'light'
    });
    
    const { index } = e.currentTarget.dataset;
    const hobbies = [...this.data.hobbies];
    hobbies.splice(index, 1);
    this.setData({ hobbies });
  },

  // 添加新的自定义块
  addCustomBlock() {
    // 添加轻微震动
    wx.vibrateShort({
      type: 'light'
    });
    
    wx.showModal({
      title: '新增自定义内容',
      editable: true,
      placeholderText: '请输入标题',
      success: (res) => {
        if (res.confirm && res.content.trim()) {
          const newBlock = {
            id: 'block_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            title: res.content.trim(),
            content: '',
            order: this.data.customBlocks.length + 1
          };
          
          this.setData({
            customBlocks: [...this.data.customBlocks, newBlock]
          }, () => {
            // 添加块后更新容器高度
            this.updateContainerHeight();
          });
        }
      }
    });
  },

  // 删除自定义块
  deleteCustomBlock(e) {
    // 添加轻微震动
    wx.vibrateShort({
      type: 'light'
    });
    
    const { id } = e.currentTarget.dataset;
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个自定义内容吗？',
      success: (res) => {
        if (res.confirm) {
          const customBlocks = this.data.customBlocks.filter(block => block.id !== id);
          // 重新排序
          const reorderedBlocks = customBlocks.map((block, index) => ({
            ...block,
            order: index + 1
          }));
          
          this.setData({
            customBlocks: reorderedBlocks
          }, () => {
            // 删除块后更新容器高度
            this.updateContainerHeight();
          });
        }
      }
    });
  },

  // 更新自定义块内容
  onCustomBlockInput(e) {
    const { id } = e.currentTarget.dataset;
    const { value } = e.detail;
    const customBlocks = this.data.customBlocks.map(block => 
      block.id === id ? { ...block, content: value } : block
    );
    
    this.setData({
      customBlocks
    });
  },

  // 添加数据过滤函数
  filterEmptyFields(data) {
    const filteredData = {};
    
    // 检查基本信息
    if (data.name?.trim()) filteredData.name = data.name;
    if (data.title?.trim()) filteredData.title = data.title;
    
    // 检查联系方式
    if (data.phone?.trim()) filteredData.phone = data.phone;
    if (data.email?.trim()) filteredData.email = data.email;
    if (data.address?.trim()) filteredData.address = data.address;
    
    // 检查数组类型的数据
    if (data.skills?.length > 0) filteredData.skills = data.skills;
    if (data.hobbies?.length > 0) filteredData.hobbies = data.hobbies;
    
    // 检查关于我
    if (data.about?.trim()) filteredData.about = data.about;
    
    // 保留头像
    if (data.avatarUrl) filteredData.avatarUrl = data.avatarUrl;
    
    // 检查自定义块
    if (data.customBlocks?.length > 0) {
      // 只保留有内容的自定义块
      const validCustomBlocks = data.customBlocks.filter(block => block.content?.trim());
      if (validCustomBlocks.length > 0) {
        filteredData.customBlocks = validCustomBlocks;
      }
    }
    
    // 保留隐藏状态设置
    if (data.sectionHidden) filteredData.sectionHidden = data.sectionHidden;
    
    return filteredData;
  },

  // 修改更新全局数据的函数
  updateGlobalData(savedImagePath) {
    return new Promise((resolve, reject) => {
      try {
        let userInfo = {
          name: this.data.name,
          title: this.data.title,
          phone: this.data.phone,
          email: this.data.email,
          address: this.data.address,
          skills: this.data.skills,
          hobbies: this.data.hobbies,
          about: this.data.about,
          avatarUrl: savedImagePath,
          customBlocks: this.data.customBlocks,
          sectionHidden: this.data.sectionHidden
        };

        // 过滤空字段
        userInfo = this.filterEmptyFields(userInfo);

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
    // 添加轻微震动
    wx.vibrateShort({
      type: 'light'
    });
    
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
        // 4. 添加一个小延时再返回
        setTimeout(() => {
          wx.navigateBack({
            delta: 1,
            success: () => {
              wx.showToast({
                title: '保存成功',
                icon: 'success',
                duration: 1500
              });
            },
            fail: (err) => {
              console.error('返回失败：', err);
              wx.showToast({
                title: '操作完成',
                icon: 'success',
                duration: 1500
              });
            }
          });
        }, 100);
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