//渲染圖表函式
function renderC3(){
    let categoryTotal = {};
    orderData.forEach(function(item){
        item.products.forEach(function(productItem){
            if(categoryTotal[productItem.title] ==  undefined){
                categoryTotal[productItem.title] = productItem.price*productItem.quantity;
            }else{
                categoryTotal[productItem.title] += productItem.price*productItem.quantity;
            }
        })
    })

    //重新排序類別
    const categoryEntries = Object.entries(categoryTotal);
    categoryEntries.sort((a, b)=> b[1] - a[1]);
    categoryEntries
    let otherProduct = [];
    let otherTotal = ["其他"];
    if(categoryEntries.length > 3){
        otherProduct = categoryEntries.slice(3); //參數使用的是index
        otherProduct.forEach((item, index) =>{
            if(otherTotal[1] == undefined){
                otherTotal.push(item[1]);
            }else{
                otherTotal[1] += item[1];
            }
        })
        categoryEntries.splice(3,Infinity, otherTotal);//內建元素Infinity無限大
    }


        // C3.js
    c3.generate({
        bindto: '#chart', // HTML 元素綁定
        data: {
            type: "pie",
            columns: categoryEntries
        },
        color:{
            pattern: ["#DACBFF", "#9D7FEA","#5434A7","#301E5F"]
        }
    });
}



//綁定訂單位置
const orderList = document.querySelector('.order-list');
let orderData =  []

//初始化
function init(){
    getOrderList();
}

init();


//取得訂單列表
function getOrderList(){

    axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`,{
        headers:{
            'authorization': api_token,
        }
    }).then(function(res){
        orderData = res.data.orders;
        //渲染訂單列表
        let str = "";
        orderData.forEach(item => {
            //個人品項列表
            let productStr = "";
            item.products.forEach(function(productItem){
                productStr +=  `<p>${productItem.title} x ${productItem.quantity
                }</p>`
            })

            //時間轉換 時間戳 new Date轉換要13碼
            const translateTime = new Date(item.createdAt*1000);
            //時間轉換函式
            const orderTime = `${translateTime.getFullYear()}/${translateTime.getMonth()}/${translateTime.getDate()}`


            //判斷訂單狀態  
            let orderStatus = ""
            if(item.paid == true){
                orderStatus = "已處理"
            }else{
                orderStatus = "未處理"
            }

            //產品訂單渲染
            str += `<tr>
                    <td>${item.id}</td>
                    <td>
                        <p>${item.user.name}</p>
                        <p>${item.user.tel}</p>
                    </td>
                    <td>${item.user.address}</td>
                    <td>${item.user.email}</td>
                    <td>
                       ${productStr}
                    </td>
                    <td>${orderTime}</td>
                    <td>
                        <a href="#"  class="orderStatus"  data-status="${item.paid}"  data-id ="${item.id}" >${orderStatus}</a>
                    </td>
                    <td>
                        <input type="button" class="delSingleOrder-Btn"  data-id ="${item.id}"  value="刪除">
                    </td>
                </tr>`     
        });
        orderList.innerHTML = str;
        renderC3();
    }).catch(errors =>{
        console.log(errors.message);
    })
}


//改變訂單處理狀態＆刪除單筆訂單判斷
orderList.addEventListener("click", function(e){
    e.preventDefault();
    const targetClass = e.target.getAttribute("class");
    let id = e.target.getAttribute("data-id");
    if(targetClass == "delSingleOrder-Btn"){
        deleteOrderItem(id);
        return;
    }



    if(targetClass == "orderStatus"){
        let status = e.target.getAttribute("data-status");
        toggleOrderItem(status, id);
        return;
    }

})


//切換訂單項目狀態
function toggleOrderItem(status, id){
    let newStatus = true;
    if(status == "true" ){
        newStatus = false;
    }
    axios.put(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`,{
        "data": {
          "id": id,
          "paid": newStatus
        }
      },{
        headers:{
            'authorization': api_token,
        }
    }).then(function(res){
        alert("修改訂單狀態成功！");
        getOrderList();
    }).catch(errors =>{
        console.log(errors.message);
    })
}

//刪除訂單項目
function deleteOrderItem(id){
    axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders/${id}`,{
        headers:{
            'authorization': api_token,
        }
    }).then(function(res){
        alert("刪除該筆訂單成功");
        getOrderList();
    }).catch(errors =>{
        console.log(errors.message);
    })

}

//刪除全部訂單
const discardAllBtn = document.querySelector(".discardAllBtn");

discardAllBtn.addEventListener("click",function(e){
    e.preventDefault();
    axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`,{
        headers:{
            'authorization': api_token,
        }
    }).then(function(rers){
        alert("刪除全部訂單成功");
        getOrderList();
    }).catch(errors =>{
        console.log(errors.message);
    })
})
