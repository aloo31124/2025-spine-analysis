const Customer = require('../models/customer.model');

/* 匯出所有 客戶 列表 */
exports.exportAllCustomerList = async () => {
    return this.searchCustomer({},{});
}

/* 匯入 所有 客戶 進入空表, 不卡控, 使用於備份還原。 */
exports.importAllCustomer = async (customerList) => {
    try {
        return await Customer.importAllCustomer(customerList);
    } catch (error) {
        console.error("[importAllCustomer] error :", error);
    }
}

/* 取得客戶列表 */
exports.getCustomerList = async () => {
    try {
        console.log("[getCustomerList] start :");
        const customerList = await this.searchCustomer({},{});
        console.log("[getCustomerList] end , result :", customerList);
        return customerList;
    } catch (error){
        console.error("[getCustomerList] error :", error);
    }
}

/* 搜尋客戶 */
exports.searchCustomer = async (searchParam, pagingParam, userId = null) => {
    try {
        console.log("[searchCustomer] start :");
        // 取得所有客戶, 篩選條件
        const {keyword, state, phone, email} = searchParam;
        const _customerList = (await Customer.getAllCustomerList()).filter(customer => 
            (keyword ? (customer.name && customer.name.includes(keyword)) || (customer.email && customer.email.includes(keyword)) : true) 
            && (state ? customer.state === state : true) 
            && (phone ? customer.phone && customer.phone.includes(phone) : true) 
            && (email ? customer.email && customer.email.includes(email) : true) 
            && (userId ? customer.userId === userId : true)
        ); 

        let customerList = _customerList;

        // 分頁 臨時寫法
        let { pageIndex, pageSize, sort } = pagingParam; // 分頁參數
        if(pageIndex && pageSize) {
            pagingParam.dataTotal = (customerList.length);
            pagingParam.pageTotal = Math.ceil(customerList.length / pageSize);
            customerList = customerList.slice((pageIndex - 1) * pageSize, pageIndex * pageSize);
        }
        console.log("[searchCustomer] end , result :", customerList);
        return {customerList, pagingParam};
    } catch (error){
        console.error("[searchCustomer] error :", error);
    }
}

/* 新增客戶 */
exports.addCustomer = async (customer) => {
    return Customer.addCustomer(customer);
}

/* 取得客戶 */
exports.getCustomer = async (id) => {
    return Customer.getCustomer(id);
}

/* 更新客戶 */
exports.updateCustomer = async (customer) => {
    return Customer.updateCustomer(customer);
}

/* 刪除客戶 */
exports.deleteCustomer = async (id) => {
    return Customer.deleteCustomer(id);
}

/* 匯入客戶 */
exports.importCustomer = async (customerList) => {
    return Customer.importCustomer(customerList);
}