// index.js
Page({
  data: {
    userInfo: {
      name: '名片君',
      title: '前端理发师',
      phone: '',
      email: '',
      address: '',
      skills: ['吃', '睡', '玩'],
      hobbies: ['玩', '睡', '吃'],
      about: '这个人很懒，什么介绍也没留下。',
      avatarUrl: '/images/avatar.png',
      wechatQr: '', // 新增：微信二维码图片路径
      worksQr: ''   // 新增：个人作品二维码图片路径
    },
    ctx: null,
    canvas: null,
    isGenerating: false  // 添加状态标记，防止重复生成
  },

  onLoad() {
    // 初始化时，如果本地存储没有数据，将默认数据保存到本地存储
    const storedUserInfo = wx.getStorageSync('userInfo');
    console.log('index页面onLoad，获取到的本地userInfo：', storedUserInfo);
    if (!storedUserInfo) {
      wx.setStorageSync('userInfo', this.data.userInfo);
      console.log('index页面onLoad，写入默认userInfo：', this.data.userInfo);
    }
    this.loadUserInfo();
  },

  onShow() {
    console.log('index页面onShow');
    this.loadUserInfo();
  },

  loadUserInfo() {
    const storedUserInfo = wx.getStorageSync('userInfo');
    console.log('index页面loadUserInfo，获取到的userInfo：', storedUserInfo);
    if (storedUserInfo) {
      console.log('index页面loadUserInfo，wechatQr路径：', storedUserInfo.wechatQr);
      this.setData({
        userInfo: storedUserInfo
      }, () => {
        console.log('index页面setData后userInfo：', this.data.userInfo);
        console.log('index页面setData后wechatQr路径：', this.data.userInfo.wechatQr);
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

  // 修改 drawBackground 方法，名片主体全画布宽高，圆角36px，带阴影，底色#f5f7fa，无留白
  drawBackground(contentHeight) {
    const ctx = this.ctx;
    const canvasWidth = 750;

    // 1. 绘制画布底色
    ctx.fillStyle = '#f5f7fa';
    ctx.fillRect(0, 0, canvasWidth, contentHeight);

    // 2. 设置卡片阴影
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.12)';
    ctx.shadowBlur = 24;
    ctx.shadowOffsetY = 8;

    // 3. 绘制名片主体（全画布宽高，圆角36px）
    this.drawRoundRectWithCompat(ctx, 0, 0, canvasWidth, contentHeight, 36);

    // 4. 重置阴影
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
  },

  // 绘制头像
  async drawAvatar() {
    // 检查头像是否隐藏
    const hiddenSections = this.data.userInfo.sectionHidden || {};
    if (hiddenSections.avatar) {
      return; // 如果头像被隐藏，则不绘制
    }
    
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

          // 【修改】实现 aspectFill 效果，裁剪图片并绘制到目标区域
          const imgWidth = img.width;
          const imgHeight = img.height;
          const destSize = radius * 2; // 目标绘制区域尺寸 (正方形)

          let sx, sy, sWidth, sHeight;

          // 计算源矩形以实现 aspectFill
          if (imgWidth / imgHeight > destSize / destSize) { // 图片宽高比 > 目标宽高比 (即图片比目标区域宽)
            sHeight = imgHeight;
            sWidth = imgHeight * (destSize / destSize); // sWidth = imgHeight * 1 = imgHeight
            sx = (imgWidth - sWidth) / 2; // 水平居中裁剪
            sy = 0;
          } else { // 图片宽高比 <= 目标宽高比 (即图片比目标区域高或宽高比相同)
            sWidth = imgWidth;
            sHeight = imgWidth * (destSize / destSize); // sHeight = imgWidth * 1 = imgWidth
            sx = 0;
            sy = (imgHeight - sHeight) / 2; // 垂直居中裁剪
          }

          // 目标绘制区域
          const dx = centerX - radius;
          const dy = centerY - radius;
          const dWidth = destSize;
          const dHeight = destSize;

          // 使用裁剪后的源矩形和目标矩形绘制图片
          ctx.drawImage(img, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
          
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
    
    y += 20;
    
    // 绘制标题，增大字体
    ctx.fillStyle = '#333333';
    ctx.font = 'bold 32px sans-serif';  // 改为32px
    ctx.textAlign = 'center';
    ctx.fillText('关于我', 375, y);
    
    // 计算文本区域的位置和大小
    const textStartY = y + 60;  // 增加与标题的间距
    const textPadding = 30;  // 增加内边距
    const charWidth = ctx.measureText('我').width;
    const textAreaWidth = 650;  // 增加文本区域宽度
    const textAreaStartX = 375 - textAreaWidth/2;
    const maxWidth = textAreaWidth - 2 * textPadding;
    
    // 设置文本样式
    ctx.fillStyle = '#666666';
    ctx.font = '28px sans-serif';  // 再调大一点
    ctx.textAlign = 'left';
    
    // 【修改】文本换行处理和高度计算，保留用户输入的换行符
    let lines = [];
    
    // 首先按用户输入的换行符分割
    const paragraphs = about.split('\n');
    
    // 对每个段落进行宽度限制处理
    paragraphs.forEach(paragraph => {
      if (paragraph === '') {
        // 如果是空行，直接添加，保留用户的空行
        lines.push('');
      } else {
        // 处理文本宽度限制
        const words = paragraph.split('');
    let currentLine = '';
    
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
      }
    });
    
    const lineHeight = 42;  // 再调大一点
    const textHeight = lines.length * lineHeight;
    
    // 绘制背景
    ctx.fillStyle = '#f9f9f9';
    this.drawRoundRectWithCompat(
      ctx,
      textAreaStartX,
      textStartY - textPadding,
      textAreaWidth,
      textHeight + textPadding * 2,
      20  // 增加圆角
    );
    
    // 绘制文本
    ctx.fillStyle = '#666666';
    let currentY = textStartY + textPadding;
    
    lines.forEach(line => {
      // 如果不是空行才绘制文本，空行只占位
      if (line !== '') {
      ctx.fillText(line, textAreaStartX + textPadding, currentY);
      }
      currentY += lineHeight;
    });
    
    return currentY + textPadding + 50;  // 增加底部间距
  },

  // 修改 drawInfo 方法，调整文本区域宽度和字体大小
  async drawInfo() {
    try {
      const ctx = this.ctx;
      const info = this.data.userInfo;
      const hiddenSections = this.data.userInfo.sectionHidden || {};
      
      // 修改：调整文本区域宽度和起始位置
      const centerX = 375;  // 画布中心点保持不变
      const textAreaWidth = 650;  // 增加文本区域宽度
      const textStartX = centerX - textAreaWidth/2 + 50;  // 调整文本起始位置
      
      // 仅当头像未隐藏时才绘制姓名和职位
      if (!hiddenSections.basic) {
        // 绘制姓名，增大字体，并下移让头像和姓名有间距
        ctx.fillStyle = '#333333';
        ctx.font = 'bold 42px sans-serif';  // 增大字体
        ctx.textAlign = 'center';
        ctx.fillText(info.name || '', centerX, 340); // 下移40px
        
        // 绘制职位，增大字体
        ctx.fillStyle = '#333333';  // 从#4A90E2改为#333333
        ctx.font = '28px sans-serif';  // 增大字体
        ctx.fillText(info.title || '', centerX, 380);  // 跟随姓名下移
      }
      
      let y = 430;  // 跟随整体下移
      
      // 绘制联系方式，仅当联系方式区域未隐藏时
      if (!hiddenSections.contact && (info.phone || info.email || info.address)) {
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
      
      // 绘制技能部分，仅当技能区域未隐藏时
      if (!hiddenSections.skills && Array.isArray(info.skills) && info.skills.length > 0) {
        this.drawDivider(centerX, y);
        y += 40;
        // 【修改】先清除这块区域，确保不受前面内容影响
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, y, 750, 300);
        y = await this.drawSkillsSection(y, textStartX, textAreaWidth);
      }
      
      // 绘制爱好部分，仅当爱好区域未隐藏时
      if (!hiddenSections.hobbies && Array.isArray(info.hobbies) && info.hobbies.length > 0) {
        // 【修改】减小额外间距
        y += 20; // 【修改】减小额外间距，从50改为20
        
        // 【修改】先清除这块区域，确保不受前面内容影响
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, y, 750, 300);
        
        y = await this.drawHobbiesSection(y, textStartX, textAreaWidth);
      }
      
      // 绘制自我介绍，仅当自我介绍区域未隐藏时
      if (!hiddenSections.about && info.about) {
        // 【修改】减小额外间距
        y += 20; // 【修改】减小额外间距，从50改为20
        
        // 【修改】先清除这块区域，确保不受前面内容影响
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, y, 750, 300);
        
        y = await this.drawAbout(y, textStartX, textAreaWidth);
      }
      
      // 绘制自定义块，每个块单独检查是否隐藏
      if (Array.isArray(info.customBlocks) && info.customBlocks.length > 0) {
        y = await this.drawCustomBlocks(y, textStartX, textAreaWidth, hiddenSections);
      }

      // 新增：绘制二维码橱窗
      y = await this.drawQrSection(y, textStartX, textAreaWidth, hiddenSections);
      
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

  // 修改 drawSkillsSection 方法，添加灰色背景框
  drawSkillsSection(y, startX, areaWidth) {
    const ctx = this.ctx;
    const skills = this.data.userInfo.skills;
    
    // 增加初始间距
    y += 50;
    
    // 绘制标题（居中），增大字体
    ctx.fillStyle = '#333333';
    ctx.font = 'bold 32px sans-serif';  // 增大字体
    ctx.textAlign = 'center';
    ctx.fillText('我擅长', 375, y);
    
    // 计算每个标签的宽度，增加内边距
    const tagWidths = skills.map(skill => ({
      text: skill,
      width: ctx.measureText(skill).width + 30  // 减小内边距，从60改为40
    }));
    
    // 修改这里，让标题与内容的间距与"关于我"保持一致
    let currentY = y + 80;  // 【修改】增加更多间距，从60改为80
    const spacing = 30;  // 增加标签间距
    const maxLineWidth = 650;  // 增加最大行宽
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
    
    // 计算背景框的高度
    const lineHeight = 80;  // 【修改】增加行高，从70改为80
    const padding = 40;  // 内边距
    const backgroundHeight = lines.length * lineHeight + padding * 2;
    
    // 绘制背景框，调整位置确保不会与标题重叠
    ctx.fillStyle = '#fcfcfc';
    // 修改背景框宽度，使之与其他板块一致
    const bgWidth = 650; // 【修改】统一背景框宽度为650px，与其他板块保持一致
    this.drawRoundRectWithCompat(
      ctx,
      375 - bgWidth/2,  // 【修改】使用固定宽度，保证所有板块宽度一致
      currentY - 15 - padding,  // 【修改】将背景框的起始Y坐标下移，从-25改为-15
      bgWidth,  // 【修改】使用固定宽度
      backgroundHeight,
      20
    );
    
    // 绘制每一行标签
    lines.forEach(line => {
      const lineWidth = line.reduce((sum, tag, index) => 
        sum + tag.width + (index > 0 ? spacing : 0), 0);
      
      let currentX = 375 - lineWidth / 2;
      
      line.forEach((tag, index) => {
        // 使用通用方法绘制标签背景，增加高度
        ctx.fillStyle = '#f0f4ff';
        this.drawRoundRectWithCompat(ctx, currentX, currentY - 15, tag.width, 50, 25);  // 【修改】标签背景也下移，从-25改为-15
        
        // 绘制标签文字，增大字体
        ctx.fillStyle = '#333333';
        ctx.font = '28px sans-serif';
        ctx.textAlign = 'center';
        // 调整文字垂直位置以确保真正居中
        // 在Canvas中，文本基线默认是alphabetic，我们需要调整Y坐标使文本垂直居中
        ctx.fillText(tag.text, currentX + tag.width/2, currentY + 18);  // 【修改】进一步调整文字位置，从+15改为+18，确保完全垂直居中
        
        currentX += tag.width + spacing;
      });
      
      currentY += lineHeight;
    });

    // 返回下一个板块应该开始的Y坐标
    return currentY + 40;  // 【修改】减小底部间距，从60改为40，让"我擅长"和"我喜欢"间隔更接近
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

  // 修改 drawHobbiesSection 方法，添加灰色背景框
  drawHobbiesSection(y, startX, areaWidth) {
    const ctx = this.ctx;
    const hobbies = this.data.userInfo.hobbies;
    
    // 【修改】减小与前一个板块的间距
    y += 40;  // 【修改】从60改为40，减小与前一个板块的间距
    
    // 绘制标题（居中），增大字体
    ctx.fillStyle = '#333333';
    ctx.font = 'bold 32px sans-serif';  // 增大字体
    ctx.textAlign = 'center';
    ctx.fillText('我喜欢', 375, y);
    
    // 计算每个标签的宽度，增加内边距
    const tagWidths = hobbies.map(hobby => ({
      text: hobby,
      width: ctx.measureText(hobby).width + 30  // 减小内边距，从60改为40
    }));
    
    // 与"关于我"保持一致的间距
    let currentY = y + 80;  // 【修改】增加更多间距，从60改为80
    const spacing = 30;  // 增加标签间距
    const maxLineWidth = 650;  // 增加最大行宽
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
    
    // 计算背景框的高度
    const lineHeight = 80;  // 【修改】增加行高，从70改为80
    const padding = 40;  // 内边距
    const backgroundHeight = lines.length * lineHeight + padding * 2;
    
    // 绘制背景框，调整位置确保不会与标题重叠
    ctx.fillStyle = '#fcfcfc';
    // 修改背景框宽度，使之与其他板块一致
    const bgWidth = 650; // 【修改】统一背景框宽度为650px，与其他板块保持一致
    this.drawRoundRectWithCompat(
      ctx,
      375 - bgWidth/2,  // 【修改】使用固定宽度，保证所有板块宽度一致
      currentY - 15 - padding,  // 【修改】将背景框的起始Y坐标下移，从-25改为-15
      bgWidth,  // 【修改】使用固定宽度
      backgroundHeight,
      20
    );
    
    // 绘制每一行标签
    lines.forEach(line => {
      const lineWidth = line.reduce((sum, tag, index) => 
        sum + tag.width + (index > 0 ? spacing : 0), 0);
      
      let currentX = 375 - lineWidth / 2;
      
      line.forEach((tag, index) => {
        // 使用通用方法绘制标签背景，增加高度
        ctx.fillStyle = '#f0f4ff';
        this.drawRoundRectWithCompat(ctx, currentX, currentY - 15, tag.width, 50, 25);  // 【修改】标签背景也下移，从-25改为-15
        
        // 绘制标签文字，增大字体
        ctx.fillStyle = '#333333';
        ctx.font = '28px sans-serif';
        ctx.textAlign = 'center';
        // 调整文字垂直位置以确保真正居中
        // 在Canvas中，文本基线默认是alphabetic，我们需要调整Y坐标使文本垂直居中
        ctx.fillText(tag.text, currentX + tag.width/2, currentY + 18);  // 【修改】进一步调整文字位置，从+15改为+18，确保完全垂直居中
        
        currentX += tag.width + spacing;
      });
      
      currentY += lineHeight;
    });

    // 返回下一个板块应该开始的Y坐标
    return currentY + 60;  // 【修改】减小底部间距，从100改为60，与正常板块间距保持一致
  },

  // 修改自定义块方法，添加对换行符的支持
  async drawCustomBlocks(y, startX, areaWidth, hiddenSections) {
    const ctx = this.ctx;
    const customBlocks = this.data.userInfo.customBlocks;
    
    if (!Array.isArray(customBlocks) || customBlocks.length === 0) {
      return y;
    }
    
    let currentY = y;
    let isFirstVisible = true; // 用于跟踪是否是第一个可见的自定义块
    
    for (const block of customBlocks) {
      // 检查该自定义块是否隐藏
      if (hiddenSections[block.id]) {
        continue; // 如果隐藏，则跳过该块的绘制
      }
      
      // 只有第一个自定义块需要分隔线 (与关于我之间)
      if (isFirstVisible) {
        isFirstVisible = false; // 设置为false，后续块不再添加分隔线
      } else {
        // 不绘制分隔线，但添加一些空间
        currentY += 30;
      }
      
      // 绘制标题
      ctx.fillStyle = '#333333';
      ctx.font = 'bold 32px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(block.title, 375, currentY);
      
      // 计算文本区域的位置和大小
      const textStartY = currentY + 60;  // 增加与标题的间距
      const textPadding = 30;  // 增加内边距
      const textAreaWidth = 650;  // 统一为650px，与关于我一致
      const textAreaStartX = 375 - textAreaWidth/2;  // 居中
      const maxWidth = textAreaWidth - 2 * textPadding;  // 考虑内边距
      
      // 设置文本样式用于计算
      ctx.fillStyle = '#666666';
      ctx.font = '28px sans-serif';
      ctx.textAlign = 'left';
      
      // 【修改】文本换行处理和高度计算，保留用户输入的换行符
      let lines = [];
      
      // 首先按用户输入的换行符分割
      const paragraphs = block.content.split('\n');
      
      // 对每个段落进行宽度限制处理
      paragraphs.forEach(paragraph => {
        if (paragraph === '') {
          // 如果是空行，直接添加，保留用户的空行
          lines.push('');
        } else {
          // 处理文本宽度限制
          const words = paragraph.split('');
      let currentLine = '';
      
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
        }
      });
      
      const lineHeight = 42;  // 行高
      const textHeight = lines.length * lineHeight;
      
      // 绘制背景
      ctx.fillStyle = '#f9f9f9';
      this.drawRoundRectWithCompat(
        ctx,
        textAreaStartX,
        textStartY - textPadding,
        textAreaWidth,
        textHeight + textPadding * 2,
        20  // 圆角
      );
      
      // 绘制文本
      ctx.fillStyle = '#666666';
      let textY = textStartY + textPadding;
      
      lines.forEach(line => {
        // 如果不是空行才绘制文本，空行只占位
        if (line !== '') {
        ctx.fillText(line, textAreaStartX + textPadding, textY);
        }
        textY += lineHeight;
      });
      
      currentY = textY + textPadding + 50;  // 增加底部间距
    }
    
    return currentY;
  },

  // 新增：绘制二维码橱窗部分
  async drawQrSection(y, startX, areaWidth, hiddenSections) {
    const ctx = this.ctx;
    const info = this.data.userInfo;
    let currentY = y;

    // 检查整个二维码区块是否需要显示
    const showWechatQr = !hiddenSections.wechatQr && info.wechatQr;
    const showWorksQr = !hiddenSections.worksQr && info.worksQr;
    
    if (!showWechatQr && !showWorksQr) {
      return y; // 如果两个都不显示，则跳过整个区块
    }

    // 绘制分割线
    this.drawDivider(375, currentY + 40); // 添加分隔线
    currentY += 100; // 留出分割线和标题空间，整体向下移动

    // 绘制标题
    ctx.fillStyle = '#333';
    ctx.font = 'bold 32px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('联系我', 375, currentY);

    currentY += 40; // 标题与二维码容器间距

    const qrContainerY = currentY; // 记录二维码容器的起始Y坐标
    const qrItemWidth = (areaWidth - 20) / 2; // 每个二维码项的宽度 (减去间距) - 这里 areaWidth 是 650，间距 20
    const qrItemHeight = 200 + 18 + 28 + 5 + 24 + 20 * 2; // 图片高 + 图片底部间距 + 标签高 + 标签底部间距 + 描述高 + 上下padding (20*2)
    const qrItemPadding = 20; // qr-item 的内边距
    const qrImgSize = 160; // qr-img 的尺寸
    const qrLabelHeight = 28; // qr-label 高度
    const qrDescHeight = 24; // qr-desc 高度
    const qrImgMarginBottom = 18;
    const qrLabelMarginBottom = 5;
    const qrItemSpacing = 20; // qr-item 之间的间距

    let nextY = qrContainerY + qrItemHeight; // 假设的下一个板块起始Y坐标

    // 判断是单个显示还是双个显示
    const isSingleQr = (showWechatQr && !showWorksQr) || (!showWechatQr && showWorksQr);

    // 绘制微信二维码项
    if (showWechatQr) {
      let itemX;
      if (isSingleQr) {
        // 单个显示时居中计算
        itemX = 375 - qrItemWidth / 2; // 画布中心X - 单个二维码项宽度的一半
      } else {
        // 双个显示时靠左计算
        itemX = 375 - areaWidth / 2; // 画布中心X - 二维码总区域宽度的一半
      }

      // 绘制背景和阴影
      ctx.fillStyle = '#f8f9fa';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.05)';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetY = 4;
      this.drawRoundRectWithCompat(ctx, itemX, qrContainerY, qrItemWidth, qrItemHeight, 16);
      ctx.shadowColor = 'transparent'; // 重置阴影

      // 绘制图片占位背景和边框
      const imgPlaceholderX = itemX + qrItemWidth/2 - qrImgSize/2;
      const imgPlaceholderY = qrContainerY + qrItemPadding + 20;
      ctx.fillStyle = '#fff';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
      ctx.shadowBlur = 20;
      ctx.shadowOffsetY = 8;
      this.drawRoundRectWithCompat(ctx, imgPlaceholderX, imgPlaceholderY, qrImgSize, qrImgSize, 16);
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 8;
      ctx.stroke();
      ctx.shadowColor = 'transparent'; // 重置阴影

      // 绘制图片
      const img = this.canvas.createImage();
      img.src = info.wechatQr;
      await new Promise(resolve => {
        img.onload = () => {
          // 调整图片绘制位置和尺寸，使其在边框内部
          ctx.drawImage(img, imgPlaceholderX + 4, imgPlaceholderY + 4, qrImgSize - 8, qrImgSize - 8);
          resolve();
        };
        img.onerror = () => { // 加载失败时绘制占位符
           const placeholderImg = this.canvas.createImage();
           placeholderImg.src = '/images/qr-placeholder.png';
           placeholderImg.onload = () => {
             // 调整占位符绘制位置和尺寸，使其在边框内部
             ctx.drawImage(placeholderImg, imgPlaceholderX + 4, imgPlaceholderY + 4, qrImgSize - 8, qrImgSize - 8);
             resolve();
           };
           placeholderImg.onerror = () => resolve(); // 占位符也加载失败则直接resolve
        };
      });

      // 绘制标签
      ctx.fillStyle = '#2c3e50';
      ctx.font = '600 28px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('微信', itemX + qrItemWidth/2, imgPlaceholderY + qrImgSize + qrImgMarginBottom + qrLabelHeight/2 + 10);

      // 绘制描述
      ctx.fillStyle = '#7f8c8d';
      ctx.font = '24px sans-serif';
      ctx.fillText('扫一扫添加好友', itemX + qrItemWidth/2, imgPlaceholderY + qrImgSize + qrImgMarginBottom + qrLabelHeight + qrLabelMarginBottom + qrDescHeight/2 + 10);
    }

    // 绘制个人作品二维码项
    if (showWorksQr) {
      let itemX;
      if (isSingleQr) {
        // 单个显示时居中计算
        itemX = 375 - qrItemWidth / 2; // 画布中心X - 单个二维码项宽度的一半
      } else {
        // 双个显示时靠右计算
        itemX = 375 - areaWidth / 2 + qrItemWidth + qrItemSpacing; // 画布中心X - 二维码总区域宽度的一半 + 一个二维码项宽度 + 间距
      }

      // 【修改】调用新的绘制单个二维码项函数
      await this.drawSingleQrItem(ctx, info, itemX, qrContainerY, qrItemWidth, qrItemHeight, qrItemPadding, qrImgSize, qrImgMarginBottom, qrLabelHeight, qrLabelMarginBottom, qrDescHeight, info.worksQr, '其他账号', '查看更多');
    }

    // 返回下一个板块的Y坐标
    return nextY + 60; // 增加底部间距
  },

  // 新增：绘制单个二维码项的函数 (封装复用逻辑)
  async drawSingleQrItem(ctx, info, itemX, qrContainerY, qrItemWidth, qrItemHeight, qrItemPadding, qrImgSize, qrImgMarginBottom, qrLabelHeight, qrLabelMarginBottom, qrDescHeight, qrPath, qrLabelText, qrDescText) {

     // 绘制背景和阴影
     ctx.fillStyle = '#f8f9fa';
     ctx.shadowColor = 'rgba(0, 0, 0, 0.05)';
     ctx.shadowBlur = 8;
     ctx.shadowOffsetY = 4;
     this.drawRoundRectWithCompat(ctx, itemX, qrContainerY, qrItemWidth, qrItemHeight, 16);
     ctx.shadowColor = 'transparent'; // 重置阴影

     // 绘制图片占位背景和边框
      const imgPlaceholderX = itemX + qrItemWidth/2 - qrImgSize/2;
      const imgPlaceholderY = qrContainerY + qrItemPadding + 20;
      ctx.fillStyle = '#fff';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
      ctx.shadowBlur = 20;
      ctx.shadowOffsetY = 8;
      this.drawRoundRectWithCompat(ctx, imgPlaceholderX, imgPlaceholderY, qrImgSize, qrImgSize, 16);
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 8; // 边框变大
      ctx.stroke();
      ctx.shadowColor = 'transparent'; // 重置阴影

     // 绘制图片
     const img = this.canvas.createImage();
     img.src = qrPath;
     await new Promise(resolve => {
       img.onload = () => {
         // 调整图片绘制位置和尺寸，使其在边框内部
         ctx.drawImage(img, imgPlaceholderX + 4, imgPlaceholderY + 4, qrImgSize - 8, qrImgSize - 8);
         resolve();
       };
        img.onerror = () => { // 加载失败时绘制占位符
          const placeholderImg = this.canvas.createImage();
          placeholderImg.src = '/images/qr-placeholder.png';
          placeholderImg.onload = () => {
            // 调整占位符绘制位置和尺寸，使其在边框内部
            ctx.drawImage(placeholderImg, imgPlaceholderX + 4, imgPlaceholderY + 4, qrImgSize - 8, qrImgSize - 8);
            resolve();
          };
          placeholderImg.onerror = () => resolve(); // 占位符也加载失败则直接resolve
       };
     });

     // 绘制标签
     ctx.fillStyle = '#2c3e50';
     ctx.font = '600 28px sans-serif';
     ctx.textAlign = 'center';
     ctx.fillText(qrLabelText, itemX + qrItemWidth/2, imgPlaceholderY + qrImgSize + qrImgMarginBottom + qrLabelHeight/2 + 10); // 这里的偏移已经包含在 imgPlaceholderY 的调整中

     // 绘制描述
     ctx.fillStyle = '#7f8c8d';
     ctx.font = '24px sans-serif';
     ctx.fillText(qrDescText, itemX + qrItemWidth/2, imgPlaceholderY + qrImgSize + qrImgMarginBottom + qrLabelHeight + qrLabelMarginBottom + qrDescHeight/2 + 10); // 这里的偏移已经包含在 imgPlaceholderY 的调整中
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



