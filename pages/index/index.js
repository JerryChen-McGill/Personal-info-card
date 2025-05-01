// index.js
Page({
  data: {
    userInfo: {
      name: '名片君',
      title: '前端理发师',
      phone: '',
      email: '',
      address: '',
      skills: ['吃', '睡', '走神'],
      hobbies: ['走神', '睡', '吃'],
      about: '这个人很懒，什么介绍也没留下。',
      avatarUrl: '/images/avatar.png'
    },
    ctx: null,
    canvas: null,
    isGenerating: false  // 添加状态标记，防止重复生成
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
  },

  // 通用方法：带兼容性检查的圆角矩形绘制
  // 参数说明：
  // ctx: canvas上下文
  // x: 矩形左上角x坐标
  // y: 矩形左上角y坐标
  // width: 矩形宽度
  // height: 矩形高度
  // radius: 圆角半径
  // fill: 是否填充（可选，默认true）
  // stroke: 是否描边（可选，默认false）
  drawRoundRectWithCompat(ctx, x, y, width, height, radius, fill = true, stroke = false) {
    // 1. 检查是否支持原生 roundRect
    const supportsRoundRect = typeof ctx.roundRect === 'function';
    
    if (supportsRoundRect) {
      // 2. 支持原生方法时直接使用
      ctx.beginPath();
      ctx.roundRect(x, y, width, height, radius);
    } else {
      // 3. 不支持时使用基础方法绘制
      ctx.beginPath();
      // 从左上角开始，顺时针绘制
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + width - radius, y);
      ctx.arcTo(x + width, y, x + width, y + radius, radius);
      ctx.lineTo(x + width, y + height - radius);
      ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius);
      ctx.lineTo(x + radius, y + height);
      ctx.arcTo(x, y + height, x, y + height - radius, radius);
      ctx.lineTo(x, y + radius);
      ctx.arcTo(x, y, x + radius, y, radius);
      ctx.closePath();
    }
    
    // 4. 根据参数决定是填充还是描边
    if (fill) {
      ctx.fill();
    }
    if (stroke) {
      ctx.stroke();
    }
  },

  // 改进初始化canvas方法，支持动态高度
  async initCanvas(height = 1000) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const query = wx.createSelectorQuery();
        query.select('#cardCanvas')
          .fields({ node: true, size: true })
          .exec((res) => {
            if (res[0]) {
              const canvas = res[0].node;
              const ctx = canvas.getContext('2d');
              
              const dpr = wx.getSystemInfoSync().pixelRatio;
              canvas.width = 750 * dpr;
              canvas.height = height * dpr;  // 使用传入的高度
              
              ctx.scale(dpr, dpr);
              
              this.canvas = canvas;
              this.ctx = ctx;
              resolve();
            } else {
              reject(new Error('Canvas初始化失败'));
            }
          });
      }, 300);
    });
  },

  // 检查相册权限
  async checkPhotoPermission() {
    try {
      await wx.authorize({
        scope: 'scope.writePhotosAlbum'
      });
      return true;
    } catch (err) {
      return new Promise((resolve) => {
        wx.showModal({
          title: '需要授权',
          content: '需要相册权限才能保存图片，是否去设置？',
          success: (res) => {
            if (res.confirm) {
              wx.openSetting({
                success: (settingRes) => {
                  resolve(settingRes.authSetting['scope.writePhotosAlbum']);
                }
              });
            } else {
              resolve(false);
            }
          }
        });
      });
    }
  },

  // 修改 drawBackground 方法，调整面板宽度
  drawBackground(contentHeight) {
    const ctx = this.ctx;
    
    // 计算面板宽度（画布宽度的80%）
    const canvasWidth = 750;
    const panelWidth = Math.floor(canvasWidth * 0.8); // 600px
    const panelX = Math.floor((canvasWidth - panelWidth) / 2); // 居中显示
    
    // 1. 绘制页面背景
    ctx.fillStyle = '#f5f7fa';
    ctx.fillRect(0, 0, canvasWidth, contentHeight);
    
    // 2. 设置卡片阴影
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
    ctx.shadowBlur = 20;
    ctx.shadowOffsetY = 4;
    
    // 3. 使用通用方法绘制卡片主体
    this.drawRoundRectWithCompat(ctx, panelX, 40, panelWidth, contentHeight - 80, 30);
    
    // 4. 重置阴影
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
  },

  // 绘制头像
  async drawAvatar() {
    return new Promise((resolve, reject) => {
      const avatarUrl = this.data.userInfo.avatarUrl;
      const ctx = this.ctx;
      const img = this.canvas.createImage();
      
      img.onload = () => {
        try {
          const centerX = 375;
          const centerY = 180;
          const radius = 80;
          
          // 绘制头像边框阴影
          ctx.save();
          ctx.beginPath();
          ctx.arc(centerX, centerY, radius + 3, 0, Math.PI * 2);
          ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
          ctx.shadowBlur = 15;
          ctx.fillStyle = '#fff';
          ctx.fill();
          ctx.restore();
          
          // 绘制头像
          ctx.save();
          ctx.beginPath();
          ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
          ctx.clip();
          ctx.drawImage(img, centerX - radius, centerY - radius, radius * 2, radius * 2);
          
          // 绘制头像边框
          ctx.strokeStyle = '#fff';
          ctx.lineWidth = 6;
          ctx.stroke();
          ctx.restore();
          
          resolve();
        } catch (err) {
          reject(new Error('头像绘制失败'));
        }
      };
      
      img.onerror = () => reject(new Error('头像加载失败'));
      img.src = avatarUrl;
    });
  },

  // 添加绘制自我介绍的方法
  async drawAbout(y, startX, areaWidth) {
    const ctx = this.ctx;
    const about = this.data.userInfo.about;
    
    if (!about) return y;
    
    // 增加标题与分隔线的距离
    y += 20;
    
    // 绘制标题
    ctx.fillStyle = '#333333';
    ctx.font = 'bold 28px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('关于我', 375, y);
    
    // 计算文本区域的位置和大小
    const textStartY = y + 50;
    const textPadding = 20;
    // 计算一个汉字的宽度
    const charWidth = ctx.measureText('我').width;
    const textAreaWidth = 576 - (charWidth * 2);  // 减少宽度，为两边各留出一个汉字的空间
    const textAreaStartX = 375 - textAreaWidth/2;  // 居中
    const maxWidth = textAreaWidth - 2 * textPadding;  // 考虑内边距
    
    // 设置文本样式用于计算
    ctx.fillStyle = '#666666';
    ctx.font = '20px sans-serif';
    ctx.textAlign = 'left';
    
    // 文本换行处理和高度计算
    const words = about.split('');
    let lines = [];
    let currentLine = '';
    
    // 计算实际需要的行数和高度
    for (let i = 0; i < words.length; i++) {
      const testLine = currentLine + words[i];
      const metrics = ctx.measureText(testLine);
      
      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = words[i];
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) {
      lines.push(currentLine);
    }
    
    const lineHeight = 30;
    const textHeight = lines.length * lineHeight;
    
    // 绘制背景
    ctx.fillStyle = '#f9f9f9';
    this.drawRoundRectWithCompat(
      ctx,
      textAreaStartX,
      textStartY - textPadding,
      textAreaWidth,
      textHeight + textPadding * 2,  // 只使用实际需要的高度
      16
    );
    
    // 绘制文本
    ctx.fillStyle = '#666666';
    let currentY = textStartY + textPadding;
    
    lines.forEach(line => {
      ctx.fillText(line, textAreaStartX + textPadding, currentY);
      currentY += lineHeight;
    });
    
    return currentY + textPadding + 40;  // 适当调整底部间距
  },

  // 修改 drawInfo 方法，添加自定义块绘制
  async drawInfo() {
    try {
      const ctx = this.ctx;
      const info = this.data.userInfo;
      
      // 计算新的水平中心点和文本区域宽度
      const centerX = 375;  // 画布中心点保持不变
      const textAreaWidth = 480;  // 文本区域宽度调整为面板宽度的80%
      const textStartX = centerX - textAreaWidth/2 + 40;  // 文本起始位置
      
      // 绘制姓名
      ctx.fillStyle = '#333333';
      ctx.font = 'bold 36px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(info.name || '', centerX, 300);
      
      // 绘制职位
      ctx.fillStyle = '#4A90E2';
      ctx.font = '24px sans-serif';
      ctx.fillText(info.title || '', centerX, 340);
      
      let y = 380;
      
      // 绘制联系方式
      if (info.phone || info.email || info.address) {
        this.drawDivider(centerX, y);
        y += 40;
        
        if (info.phone) {
          await this.drawContactItem('/images/phone.png', info.phone, y, textStartX);
          y += 60;
        }
        if (info.email) {
          await this.drawContactItem('/images/e-mail.png', info.email, y, textStartX);
          y += 60;
        }
        if (info.address) {
          await this.drawContactItem('/images/address.png', info.address, y, textStartX);
          y += 60;
        }
      }
      
      // 绘制技能部分
      if (Array.isArray(info.skills) && info.skills.length > 0) {
        this.drawDivider(centerX, y);
        y += 40;
        y = await this.drawSkillsSection(y, textStartX, textAreaWidth);
      }
      
      // 绘制爱好部分
      if (Array.isArray(info.hobbies) && info.hobbies.length > 0) {
        this.drawDivider(centerX, y);
        y += 40;
        y = await this.drawHobbiesSection(y, textStartX, textAreaWidth);
      }
      
      // 绘制自我介绍
      if (info.about) {
        this.drawDivider(centerX, y);
        y += 40;
        y = await this.drawAbout(y, textStartX, textAreaWidth);
      }
      
      // 绘制自定义块
      if (Array.isArray(info.customBlocks) && info.customBlocks.length > 0) {
        y = await this.drawCustomBlocks(y, textStartX, textAreaWidth);
      }
      
      return y;
    } catch (err) {
      console.error('绘制信息失败：', err);
      throw new Error('绘制信息失败');
    }
  },

  // 绘制分割线
  drawDivider(x, y) {
    const ctx = this.ctx;
    const gradient = ctx.createLinearGradient(x - 240, y, x + 240, y);  // 增加分隔线宽度
    gradient.addColorStop(0, 'transparent');
    gradient.addColorStop(0.5, '#4A90E2');
    gradient.addColorStop(1, 'transparent');
    
    ctx.beginPath();
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 1;
    ctx.moveTo(x - 240, y);  // 增加分隔线宽度
    ctx.lineTo(x + 240, y);  // 增加分隔线宽度
    ctx.stroke();
  },

  // 绘制联系方式项
  async drawContactItem(iconPath, text, y, startX) {
    const ctx = this.ctx;
    
    try {
      // 绘制图标背景
      ctx.fillStyle = '#f0f4ff';
      ctx.beginPath();
      ctx.arc(startX + 25, y, 25, 0, Math.PI * 2);
      ctx.fill();
      
      // 绘制图标
      await new Promise((resolve, reject) => {
        const img = this.canvas.createImage();
        img.onload = () => {
          try {
            ctx.drawImage(img, startX + 9, y - 16, 32, 32);
            resolve();
          } catch (err) {
            reject(err);
          }
        };
        img.onerror = () => reject(new Error(`加载图标失败: ${iconPath}`));
        img.src = iconPath;
      });
      
      // 绘制文字
      ctx.fillStyle = '#333333';
      ctx.font = '24px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(text, startX + 60, y + 8);
    } catch (err) {
      console.error('绘制联系方式项失败：', err);
    }
  },

  // 修改 drawSkillsSection 方法，调整标题居中
  drawSkillsSection(y, startX, areaWidth) {
    const ctx = this.ctx;
    const skills = this.data.userInfo.skills;
    
    // 增加标题与分隔线的距离
    y += 20;
    
    // 绘制标题（居中）
    ctx.fillStyle = '#333333';
    ctx.font = 'bold 28px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('我擅长', 375, y);
    
    // 计算每个标签的宽度
    const tagWidths = skills.map(skill => ({
      text: skill,
      width: ctx.measureText(skill).width + 40  // 文字宽度加上内边距
    }));
    
    let currentY = y + 50;
    const spacing = 20;  // 标签之间的间距
    const maxLineWidth = 576 - 80;  // 可用宽度（减去左右边距）
    let currentLine = [];
    let currentLineWidth = 0;
    
    // 先将标签分组到不同行
    const lines = [];
    tagWidths.forEach(tag => {
      if (currentLineWidth + tag.width + (currentLine.length > 0 ? spacing : 0) <= maxLineWidth) {
        currentLine.push(tag);
        currentLineWidth += tag.width + (currentLine.length > 1 ? spacing : 0);
      } else {
        if (currentLine.length > 0) {
          lines.push(currentLine);
        }
        currentLine = [tag];
        currentLineWidth = tag.width;
      }
    });
    if (currentLine.length > 0) {
      lines.push(currentLine);
    }
    
    // 绘制每一行标签
    lines.forEach(line => {
      // 计算这一行的总宽度
      const lineWidth = line.reduce((sum, tag, index) => 
        sum + tag.width + (index > 0 ? spacing : 0), 0);
      
      // 计算这一行的起始x坐标（居中）
      let currentX = 375 - lineWidth / 2;
      
      // 绘制这一行的所有标签
      line.forEach((tag, index) => {
        // 使用通用方法绘制标签背景
        ctx.fillStyle = '#f0f4ff';
        this.drawRoundRectWithCompat(ctx, currentX, currentY - 20, tag.width, 40, 20);
        
        // 绘制标签文字
        ctx.fillStyle = '#4A90E2';
        ctx.font = '20px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(tag.text, currentX + tag.width/2, currentY + 8);
        
        currentX += tag.width + spacing;
      });
      
      currentY += 50;  // 移动到下一行
    });

    return currentY + 30;  // 返回最终的y坐标
  },

  // 绘制图标的通用方法
  async drawIcon(path, x, y, size) {
    return new Promise((resolve) => {
      const img = this.canvas.createImage();
      img.onload = () => {
        this.ctx.drawImage(img, x - size/2, y - size/2, size, size);
        resolve();
      };
      img.src = path;
    });
  },

  // 修改 drawHobbiesSection 方法，调整标题居中
  drawHobbiesSection(y, startX, areaWidth) {
    const ctx = this.ctx;
    const hobbies = this.data.userInfo.hobbies;
    
    // 增加标题与分隔线的距离
    y += 20;
    
    // 绘制标题（居中）
    ctx.fillStyle = '#333333';
    ctx.font = 'bold 28px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('我喜欢', 375, y);
    
    // 计算每个标签的宽度
    const tagWidths = hobbies.map(hobby => ({
      text: hobby,
      width: ctx.measureText(hobby).width + 40  // 文字宽度加上内边距
    }));
    
    let currentY = y + 50;
    const spacing = 20;  // 标签之间的间距
    const maxLineWidth = 576 - 80;  // 可用宽度（减去左右边距）
    let currentLine = [];
    let currentLineWidth = 0;
    
    // 先将标签分组到不同行
    const lines = [];
    tagWidths.forEach(tag => {
      if (currentLineWidth + tag.width + (currentLine.length > 0 ? spacing : 0) <= maxLineWidth) {
        currentLine.push(tag);
        currentLineWidth += tag.width + (currentLine.length > 1 ? spacing : 0);
      } else {
        if (currentLine.length > 0) {
          lines.push(currentLine);
        }
        currentLine = [tag];
        currentLineWidth = tag.width;
      }
    });
    if (currentLine.length > 0) {
      lines.push(currentLine);
    }
    
    // 绘制每一行标签
    lines.forEach(line => {
      // 计算这一行的总宽度
      const lineWidth = line.reduce((sum, tag, index) => 
        sum + tag.width + (index > 0 ? spacing : 0), 0);
      
      // 计算这一行的起始x坐标（居中）
      let currentX = 375 - lineWidth / 2;
      
      // 绘制这一行的所有标签
      line.forEach((tag, index) => {
        // 使用通用方法绘制标签背景
        ctx.fillStyle = '#f0f4ff';
        this.drawRoundRectWithCompat(ctx, currentX, currentY - 20, tag.width, 40, 20);
        
        // 绘制标签文字
        ctx.fillStyle = '#4A90E2';
        ctx.font = '20px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(tag.text, currentX + tag.width/2, currentY + 8);
        
        currentX += tag.width + spacing;
      });
      
      currentY += 50;  // 移动到下一行
    });

    return currentY + 30;  // 返回最终的y坐标
  },

  // 添加绘制自定义块的方法
  async drawCustomBlocks(y, startX, areaWidth) {
    const ctx = this.ctx;
    const customBlocks = this.data.userInfo.customBlocks;
    
    if (!Array.isArray(customBlocks) || customBlocks.length === 0) {
      return y;
    }
    
    let currentY = y;
    
    for (const block of customBlocks) {
      // 绘制分割线
      this.drawDivider(375, currentY);
      currentY += 60;  // 增加标题与分隔线的距离
      
      // 绘制标题
      ctx.fillStyle = '#333333';
      ctx.font = 'bold 28px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(block.title, 375, currentY);
      
      // 计算文本区域的位置和大小
      const textStartY = currentY + 50;
      const textPadding = 20;
      // 计算一个汉字的宽度
      const charWidth = ctx.measureText('我').width;
      const textAreaWidth = 576 - (charWidth * 2);  // 减少宽度，为两边各留出一个汉字的空间
      const textAreaStartX = 375 - textAreaWidth/2;  // 居中
      const maxWidth = textAreaWidth - 2 * textPadding;  // 考虑内边距
      
      // 设置文本样式用于计算
      ctx.fillStyle = '#666666';
      ctx.font = '20px sans-serif';
      ctx.textAlign = 'left';
      
      // 文本换行处理和高度计算
      const words = block.content.split('');
      let lines = [];
      let currentLine = '';
      
      // 计算实际需要的行数和高度
      for (let i = 0; i < words.length; i++) {
        const testLine = currentLine + words[i];
        const metrics = ctx.measureText(testLine);
        
        if (metrics.width > maxWidth && currentLine) {
          lines.push(currentLine);
          currentLine = words[i];
        } else {
          currentLine = testLine;
        }
      }
      if (currentLine) {
        lines.push(currentLine);
      }
      
      const lineHeight = 30;
      const textHeight = lines.length * lineHeight;
      
      // 绘制背景
      ctx.fillStyle = '#f9f9f9';
      this.drawRoundRectWithCompat(
        ctx,
        textAreaStartX,
        textStartY - textPadding,
        textAreaWidth,
        textHeight + textPadding * 2,  // 只使用实际需要的高度
        16
      );
      
      // 绘制文本
      ctx.fillStyle = '#666666';
      let textY = textStartY + textPadding;
      
      lines.forEach(line => {
        ctx.fillText(line, textAreaStartX + textPadding, textY);
        textY += lineHeight;
      });
      
      currentY = textY + textPadding + 40;  // 适当调整底部间距
    }
    
    return currentY;
  },

  // 修改生成图片方法，计算并传递正确的高度
  async generateCard() {
    if (this.data.isGenerating) {
      return;
    }

    try {
      this.setData({ isGenerating: true });
      
      const hasPermission = await this.checkPhotoPermission();
      if (!hasPermission) {
        wx.showToast({
          title: '需要相册权限',
          icon: 'error'
        });
        return;
      }

      wx.vibrateShort({ type: 'light' });
      wx.showLoading({ 
        title: '生成中...',
        mask: true 
      });

      try {
        // 1. 先用临时画布计算所需高度
        await this.initCanvas(1000);  // 初始高度
        this.drawBackground(1000);
        await this.drawAvatar();
        const finalY = await this.drawInfo();
        
        // 2. 计算实际需要的画布高度（内容高度 + 上下边距）
        const contentHeight = Math.max(finalY + 80, 1000);  // 确保最小高度1000
        
        // 3. 使用计算出的实际高度重新初始化画布
        await this.initCanvas(contentHeight);
        
        // 4. 重新绘制所有内容
        this.drawBackground(contentHeight);  // 传入实际内容高度
        await this.drawAvatar();
        await this.drawInfo();
        
        // 5. 等待一小段时间确保所有内容都已绘制完成
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // 6. 生成图片
        const res = await wx.canvasToTempFilePath({
          canvas: this.canvas,
          fileType: 'jpg',
          quality: 1
        });
        
        // 7. 保存到相册
        await wx.saveImageToPhotosAlbum({
          filePath: res.tempFilePath
        });
        
        wx.hideLoading();
        wx.showToast({
          title: '已保存到相册',
          icon: 'success'
        });
        
      } catch (drawErr) {
        console.error('绘制过程出错：', drawErr);
        throw new Error('绘制失败，请重试');
      }
      
    } catch (err) {
      console.error('生成名片失败：', err);
      wx.hideLoading();
      wx.showToast({
        title: err.message || '生成失败',
        icon: 'error'
      });
    } finally {
      this.setData({ isGenerating: false });
    }
  }
});



