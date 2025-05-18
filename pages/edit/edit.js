Page({
  data: {
    name: '',
    title: '',
    // 注释掉联系方式相关数据
    /*
    phone: '',
    email: '',
    address: '',
    */
    skills: [],
    hobbies: [],
    newSkill: '',
    newHobby: '',
    about: '',
    avatarUrl: '',
    isNewImageSelected: false, // 添加标记，表示是否选择了新图片
    isNewWechatQrSelected: false, // 新增：微信二维码是否新选
    isNewWorksQrSelected: false,  // 新增：个人作品二维码是否新选
    customBlocks: [], // 存储自定义块的数组
    containerHeight: 'calc(100vh + 1200rpx)', // 初始容器高度
    scrollAreaPadding: '720rpx',  // 初始底部padding
    sectionHidden: {
      avatar: false,
      basic: false,
      skills: false,
      hobbies: false,
      about: false,
      wechatQr: false, // 新增：微信二维码隐藏状态
      worksQr: false   // 新增：作品二维码隐藏状态
    }, // 存储各个区域的隐藏状态
    wechatQr: '', // 新增：微信二维码图片路径
    worksQr: ''   // 新增：个人作品二维码图片路径
  },

  // 计算容器高度和底部padding
  calculateHeight() {
    const baseHeight = 1200 // 基础内容高度
    const customBlockHeight = 466 // 每个自定义块的精确高度
    const basePadding = 720 // 基础底部padding
    const blockPadding = 50 // 每个块额外需要的padding调整值
    const qrBlockHeight = 420 // 每个二维码块的高度（含间距）
    const qrBlockCount = 2 // 二维码块数量

    const totalHeight = baseHeight + (this.data.customBlocks.length * customBlockHeight) + (qrBlockCount * qrBlockHeight)
    const totalPadding = basePadding + (this.data.customBlocks.length * blockPadding) + (qrBlockCount * 120) // padding适当小于内容高度

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
        // 注释掉联系方式相关数据加载
        /*
        phone: userInfo.phone || '',
        email: userInfo.email || '',
        address: userInfo.address || '',
        */
        skills: userInfo.skills || [],
        hobbies: userInfo.hobbies || [],
        about: userInfo.about || '',
        avatarUrl: userInfo.avatarUrl || '',
        customBlocks: userInfo.customBlocks || [], // 加载自定义块数据
        sectionHidden: userInfo.sectionHidden || {}, // 加载隐藏状态数据
        wechatQr: userInfo.wechatQr || '', // 加载微信二维码数据
        worksQr: userInfo.worksQr || ''    // 加载个人作品二维码数据
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

  // 注释掉联系方式相关的输入处理函数
  /*
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
  */

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

  // 选择微信二维码
  chooseWechatQr() {
    wx.vibrateShort({ type: 'light' });
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFilePaths[0];
        console.log('选择微信二维码成功，临时路径：', tempFilePath);
        this.setData({ wechatQr: tempFilePath, isNewWechatQrSelected: true }, () => {
          console.log('setData后 wechatQr:', this.data.wechatQr, 'isNewWechatQrSelected:', this.data.isNewWechatQrSelected);
        });
      }
    });
  },

  // 选择个人作品二维码
  chooseWorksQr() {
    wx.vibrateShort({ type: 'light' });
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFilePaths[0];
        console.log('选择作品二维码成功，临时路径：', tempFilePath);
        this.setData({ worksQr: tempFilePath, isNewWorksQrSelected: true }, () => {
          console.log('setData后 worksQr:', this.data.worksQr, 'isNewWorksQrSelected:', this.data.isNewWorksQrSelected);
        });
      }
    });
  },

  // 保存图片到本地（通用）
  saveImageToLocalPath(tempFilePath, prefix) {
    return new Promise((resolve, reject) => {
      if (!tempFilePath || tempFilePath.startsWith('wxfile://')) {
        // 已经是本地路径或为空，直接返回
        resolve(tempFilePath);
        return;
      }
      // 生成文件名，使用时间戳确保唯一性
      const fileName = `${prefix}_${Date.now()}.jpg`;
      // 使用 wx.getFileSystemManager().saveFile 替代 wx.saveFile
      const fs = wx.getFileSystemManager();
      fs.saveFile({
        tempFilePath: tempFilePath,
        success: (res) => {
          console.log('保存图片到本地成功，路径：', res.savedFilePath);
          resolve(res.savedFilePath);
        },
        fail: (err) => {
          console.error('保存图片到本地失败：', err);
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

  // 修改数据过滤函数，注释掉联系方式相关部分
  filterEmptyFields(data) {
    const filteredData = {};
    
    // 检查基本信息
    if (data.name?.trim()) filteredData.name = data.name;
    if (data.title?.trim()) filteredData.title = data.title;
    
    // 注释掉联系方式相关检查
    /*
    // 检查联系方式
    if (data.phone?.trim()) filteredData.phone = data.phone;
    if (data.email?.trim()) filteredData.email = data.email;
    if (data.address?.trim()) filteredData.address = data.address;
    */
    
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

    // 新增：保留微信二维码和作品二维码路径
    if (data.wechatQr) filteredData.wechatQr = data.wechatQr;
    if (data.worksQr) filteredData.worksQr = data.worksQr;
    
    return filteredData;
  },

  // 修改更新全局数据的函数，注释掉联系方式相关部分
  updateGlobalData(savedImagePath, savedWechatQrPath, savedWorksQrPath) {
    return new Promise((resolve, reject) => {
      try {
        let userInfo = {
          name: this.data.name,
          title: this.data.title,
          // 注释掉联系方式相关数据
          /*
          phone: this.data.phone,
          email: this.data.email,
          address: this.data.address,
          */
          skills: this.data.skills,
          hobbies: this.data.hobbies,
          about: this.data.about,
          avatarUrl: savedImagePath,
          customBlocks: this.data.customBlocks,
          sectionHidden: this.data.sectionHidden,
          wechatQr: savedWechatQrPath, // 新增
          worksQr: savedWorksQrPath    // 新增
        };
        console.log('updateGlobalData即将写入userInfo：', userInfo);
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
            console.log('首页数据更新成功', userInfo);
            resolve();
          });
        } else {
          resolve();
        }
      } catch (err) {
        console.error('updateGlobalData出错：', err);
        reject(err);
      }
    });
  },

  // 保存修改
  async saveChanges() {
    wx.vibrateShort({ type: 'light' });
    wx.showLoading({ title: '保存中...', mask: true });
    try {
      // 1. 先保存头像到本地
      let savedAvatarPath = this.data.avatarUrl;
      if (this.data.isNewImageSelected) {
        savedAvatarPath = await this.saveImageToLocalPath(this.data.avatarUrl, 'avatar');
        console.log('保存头像到本地，路径：', savedAvatarPath);
      }
      // 2. 保存微信二维码到本地
      let savedWechatQrPath = this.data.wechatQr;
      if (this.data.isNewWechatQrSelected) {
        savedWechatQrPath = await this.saveImageToLocalPath(this.data.wechatQr, 'wechatQr');
        console.log('保存微信二维码到本地，路径：', savedWechatQrPath);
      }
      // 3. 保存个人作品二维码到本地
      let savedWorksQrPath = this.data.worksQr;
      if (this.data.isNewWorksQrSelected) {
        savedWorksQrPath = await this.saveImageToLocalPath(this.data.worksQr, 'worksQr');
        console.log('保存作品二维码到本地，路径：', savedWorksQrPath);
      }
      // 4. 更新全局数据和本地存储
      await this.updateGlobalData(savedAvatarPath, savedWechatQrPath, savedWorksQrPath);
      wx.hideLoading();
      setTimeout(() => {
        wx.navigateBack({
          delta: 1,
          success: () => {
            wx.showToast({ title: '保存成功', icon: 'success', duration: 1500 });
          },
          fail: (err) => {
            wx.showToast({ title: '操作完成', icon: 'success', duration: 1500 });
          }
        });
      }, 100);
    } catch (err) {
      wx.hideLoading();
      wx.showToast({ title: '保存失败', icon: 'error', duration: 1500 });
      console.error('保存修改出错：', err);
    }
  },
}); 