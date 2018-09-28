import util from "../../util/util";
import * as qiniu from "qiniu-js";

const edit = {
  data() {
    return {
      ruleForm: {
        title: '',
        cateCode1: '',
        cateCode2: '',
        homePicture: '',
        workContext: '',
        videoHref: '',
        remark: ''
      },
      session: localStorage.getItem('sessionId'),
      levelFirst: null, // 一级分类
      levelSecond: null, // 二级分类
      videoFlag:false,//视频上传进度条
      picFlag:false,//图片上传进度条
      isLevel: true,
      isSave: false,
      saveText: '保存',
      saveReleaseText: '保存并发布',
    }
  },
  mounted() {
    if (this.$route.name !== 'createPic' && this.$route.name !== 'createVideo') {
      this.getDetails();
    }
    this.getLevel();
  },
  methods: {
    /*
     * Description: 图文、视频详情信息
     * Author: yanlichen <lichen.yan@daydaycook.com.cn>
     * Date: 2018/9/21
     */
    getDetails() {
      this.$http.httpAjax(`${this.$http.ajaxUrl}/kol/works/findOne`, {id: this.$route.params.id}).then(({data}) => {
        this.ruleForm = data.data;
        this.watchVideo();
      })
    },
    /*
     * Description: 一级分类
     * Author: yanlichen <lichen.yan@daydaycook.com.cn>
     * Date: 2018/9/21
     */
    getLevel() {
      this.$http.httpAjax(`${this.$http.ajaxUrl}/kol/works/getCodeLevel`, {levelCode: ''}).then(({data}) => {
        this.levelFirst = data.data;
      })
    },
    /*
     * Description: 二级分类
     * Author: yanlichen <lichen.yan@daydaycook.com.cn>
     * Date: 2018/9/27
     */
    getLevelTwo(value) {
      this.$http.httpAjax(`${this.$http.ajaxUrl}/kol/works/getCodeLevel`, {levelCode: value}).then(({data}) => {
        if (this.isLevel) {
          this.isLevel = false
        } else {
          this.ruleForm.cateCode2 = data.data[0].detailCode
        }
        if (this.$route.name == 'createPic') {
          this.ruleForm.cateCode2 = data.data[0].detailCode
        }
        this.levelSecond = data.data;
      })
    },
    /*
     * Description: 图片上传
     * Author: yanlichen <lichen.yan@daydaycook.com.cn>
     * Date: 2018/9/25
     */
    handlePicSuccess(res, file) {
      util.qiniuUpload(res.data, file, 1).then((url)=> {
        this.picFlag = false;
        this.ruleForm.homePicture = url
      });
    },
    picPercent(){
      this.picFlag = true;
    },
    beforeUploadPic(file) {
      const isJpg = file.type === 'image/jpeg';
      const isPng = file.type === 'image/png';
      const isGif = file.type === 'image/gif';
      if (!isJpg && !isPng && !isGif) {
        this.$message.error('上传图片不正确，只能上传 jpg、png、gif格式');
      }
      return isJpg || isPng || isGif
    },
    /*
       * Description: type -> 1 保存草稿, type -> 2 发布审核 更新保存
       * Author: yanlichen <lichen.yan@daydaycook.com.cn>
       * Date: 2018/9/26
       */
    saveRelease(type){
      delete this.ruleForm.createTime;
      delete this.ruleForm.publishTime;
      delete this.ruleForm.timeFrom1;
      delete this.ruleForm.timeFrom2;
      delete this.ruleForm.timeTo1;
      delete this.ruleForm.timeTo2;
      delete this.ruleForm.updateTime;
      if(this.$route.name === 'createPic' ){
        if(!this.ruleForm.title){
          this.$message({type: 'warning', message: '请填写标题'});
          return
        }else if(!this.ruleForm.cateCode1){
            this.$message({type: 'warning', message: '请选择分类'});
            return
        }else if(!this.ruleForm.cateCode2){
          this.$message({type: 'warning', message: '请选择分类'});
          return
        }else if(!this.ruleForm.homePicture){
            this.$message({type: 'warning', message: '请上传封面图片'});
            return
        }else if(!this.ruleForm.workContext){
            this.$message({type: 'warning', message: '请填写正文'});
            return
        }
      }else if(this.$route.name === 'createVideo'){
        if(!this.ruleForm.title){
          this.$message({type: 'warning', message: '请填写标题'});
          return
        }else if(!this.ruleForm.cateCode1){
            this.$message({type: 'warning', message: '请选择分类'});
            return
        }else if(!this.ruleForm.cateCode2){
          this.$message({type: 'warning', message: '请选择分类'});
          return
        }else if(!this.ruleForm.homePicture){
            this.$message({type: 'warning', message: '请上传封面图片'});
            return
        }else if(!this.ruleForm.videoHref){
            this.$message({type: 'warning', message: '请上传视频'});
            return
        }else if(!this.ruleForm.remark){
            this.$message({type: 'warning', message: '请填写描述'});
            return
        }
      }
      this.$confirm('确认保存?', '确认消息', {
        distinguishCancelAndClose: true,
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(() => {
        let urlSaveUpdate = ''
        if (type == 1) {
          this.ruleForm.state = 'A';
          this.saveText = '保存中...'
        } else if (type == 2) {
          this.ruleForm.state = 'W';
          this.saveReleaseText = '保存并发布中...'
        }
        this.isSave = true;
        if (this.$route.name === 'createPic') {
          this.ruleForm.workType = 1
          this.ruleForm.publishTask = 1
        } else if (this.$route.name === 'createVideo') {
          this.ruleForm.workType = 2
          this.ruleForm.publishTask = 1
        }
        if(this.$route.name === 'createPic' || this.$route.name === 'createVideo') {
          urlSaveUpdate = '/kol/works/save'
        } else {
          urlSaveUpdate = '/kol/works/update'
        }
        this.$http.httpAjax(this.$http.ajaxUrl + urlSaveUpdate, this.ruleForm).then(() => {
          if (type == 1) {
            this.saveText = '保存'
            this.$message({type: 'success', message: '保存草稿成功'});
          } else if(type == 2) {
            this.saveReleaseText = '保存并发布';
            this.$message({type: 'success', message: '保存并发布成功'});
          }
          this.isSave = false;
          if (this.$route.name === 'createPic') {
            this.$router.push({
              name: 'pic'
            })
          } else if (this.$route.name === 'createVideo') {
            this.$router.push({
              name: 'video'
            })
          }
        })
      }).catch(action => {
      });
    }
  },
  watch: {
    /*
		* Description: 监听 获取二级分类
		* Author: yanlichen <lichen.yan@daydaycook.com.cn>
		* Date: 2018/9/21
		*/
    'ruleForm.cateCode1' (value) {
      if (value) {
        this.getLevelTwo(value)
      }
    },
  }
}
export default edit;
