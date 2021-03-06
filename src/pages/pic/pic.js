import tableList from '@/components/tableListTwo'
export default {
    data() {
        return {
          activeName: '1',
          listData: {
            state: 1,
            workType: 1,
            pageIndex: 1,
            pageSize: 10
          },
          isRefresh: false
        };
    },
    components:{
        tableList
    },
    mounted(){
      this.getStatus();
    },
    methods: {
      //获取用户状态
      getStatus(){
        this.$http.httpAjax(`${this.$http.ajaxUrl}/kol/user/checkUser`).then(({data}) => {
          if(data.code=="1001" || data.code=="1002" || data.code=="1003" ){
            localStorage.setItem('navindex','1');
            this.$message({ message: '身份认证通过才可以继续操作哦',type: 'warning',duration:1500});
            setTimeout(()=>{
              this.$router.push({
                name:'idTest'
              })
            },1500)
          }
        })
      },
      /*
       * Description: 切换tab
       * Author: yanlichen <lichen.yan@daydaycook.com.cn>
       * Date: 2018/9/27
       */
      handleClick(tab) {
        this.listData = {
          workType: 1,
          pageIndex: 1,
          pageSize: 10
        }
        switch(Number(tab.name)){
          case 1:
            this.listData.state = 1;
            break;
          case 2:
            this.listData.state = 2
            break;
          case 3:
            this.listData.state = 3;
            break;
          case 4:
            this.listData.state = 4;
            break;
          case 5:
            this.listData.state = 5;
            break;
          case 6:
            this.listData.state = 6
            break;
          default:
            this.$message({message: '未知错误',type: 'error'});
        }
        this.isRefresh = true
      }
    }
};
