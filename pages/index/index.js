//index.js
//获取应用实例
const app = getApp()
const imgStat = { width: 640, height: 1136 };
Page({
  data: {
    slogan1: '',
    slogan2: '',
    orgionImgStat: {},
    sourceImg: {},
    slogans: [
      ["用科技改变教育，", "用技术解放校长。"],
      ["学而不厌", "诲人不倦"],
      ["教育最伟大的技巧是：", "知所启发。"],
      ["哥讲的不是寂寞，", "是新概念英语！"],
      ["教育为公，", "以达天下为公。"],
      ["善于鼓舞学生，", "是教育中最宝贵的经验。"],
      ["不愤不启，", "不启不发。"]
    ],
    isShowError: false,
    errorMessage: '',
    isShowLoading: false,
    isShowImg: false,
    imagePath:""
  },
  changeWord: function () {
    var n = Math.round(Math.random() * (this.data.slogans.length - 1));
    this.setData({
      slogan1: this.data.slogan[n][0],
      slogan2: this.data.slogan[n][1]
    })
  },
  //事件处理函数
  getSlogan1: function (e) {
    this.setData({
      slogan1: e.detail.value
    })
  },
  getSlogan2: function (e) {
    this.setData({
      slogan2: e.detail.value
    })
  },
  chooseimage: function () {
    var _this = this;
    wx.chooseImage({
      count: 1, // 默认9  
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有  
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有  
      success: function (res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片  
        wx.getImageInfo({
          src: res.tempFilePaths[0],
          success: function (res2) {
            let imgData = {
              path: res.tempFilePaths[0],
              width: res2.width,
              height: res2.height,
            };
            _this.setData({
              orgionImgStat: imgData,
              isShowSuccess: true
            })
          }
        })
      }
    })
  },
  checkform: function () {
    if (!this.data.orgionImgStat.path) {
      this.setData({
        isShowError: true,
        errorMessage: "请上传图片"
      })
      return false;
    }
    return true;
  },
  confirm: function () {
    if (this.checkform()) {
      this.setData({
        isShowLoading: true
      });
      this.generatePoster();
    }
  },
  generatePoster: function () {
    var that = this;
    var ctx = wx.createContext();
    //处理等比拉伸压缩用户图片并居中裁剪
    var imgRatio = imgStat.width / imgStat.height; //目标图片的宽高比
    var userimgRatio = that.data.orgionImgStat.width / that.data.orgionImgStat.height; //原始图片的宽高比
    var r = (userimgRatio > imgRatio) ? (imgStat.height / that.data.orgionImgStat.height) : (imgStat.width / that.data.orgionImgStat.width);
    var drawObj = {
      sx: userimgRatio > imgRatio ? (that.data.orgionImgStat.width * r - imgStat.width) / 2 : 0,
      sy: userimgRatio > imgRatio ? 0 : (that.data.orgionImgStat.height * r - imgStat.height) / 2,
      sWidth: imgStat.width,
      sHeight: imgStat.height,
      dx: 0,
      dy: 0,
      dWidth: imgStat.width,
      dHeight: imgStat.height
    };
    //图片居中裁剪
    ctx.drawImage(that.data.orgionImgStat.path, drawObj.sx, drawObj.sy, drawObj.sWidth, drawObj.sHeight, drawObj.dx, drawObj.dy, drawObj.dWidth, drawObj.dHeight);
    ctx.drawImage("../../images/poster_bg.png", 0, 0, imgStat.width, imgStat.height);
    ctx.fillStyle = "#fff";
    ctx.font = 36 + "px sans-serif";
    ctx.fillText(that.data.slogan1, 50, 1000);
    ctx.fillText(that.data.slogan2, 50, 1070);
    wx.drawCanvas({
      canvasId: 'imgCanvas',
      actions: ctx.getActions(),
    });
    setTimeout(function(){
      wx.canvasToTempFilePath({
        canvasId: 'imgCanvas',
        success: function success(res) {
          that.setData({
            imagePath: res.tempFilePath,
            isShowImg: true
          });
        }
      });
    },500)
  },
  //canvas竖排文字，value(文本)，ctx(canvas上下文)，x(x坐标），y(y坐标),drop(文字行高)
  verticalWord: function (value, ctx, x, y, drop) {
    var newvalue = value.split("");
    for (var i = 0; i < newvalue.length; i++) {
      ctx.fillText(newvalue[i], x, y);
      y += drop;
    }
  },
  //canvas黑白滤镜
  imageFilter: function (ctx, x, y) {
    var imgdata = ctx.getImageData(0, 0, x, y);
    var data = imgdata.data;
    for (var i = 0, n = data.length; i < n; i += 4) {
      var average = (data[i] + data[i + 1] + data[i + 2]) / 3;
      data[i] = average;
      data[i + 1] = average;
      data[i + 2] = average;
    }
    ctx.putImageData(imgdata, 0, 0);
    ctx.save();
  },
})
