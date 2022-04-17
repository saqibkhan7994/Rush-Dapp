App = {
    web3: null,
    contracts: {},
    address:'0xAD26ddE83A6A4212D81b57c86e92c4b3c2a6bB23',
    network_id:3, // 5777 for local
    handler:null,
    value:1000000000000000000,
    index:0,
    margin:10,
    left:15,
    init: function() {
      return App.initWeb3();
    },
  
    initWeb3: function() {         
      if (typeof web3 !== 'undefined') {
        App.web3 = new Web3(Web3.givenProvider);
      } else {
        App.web3 = new Web3(App.url);
      }
      ethereum.enable();  
         
      return App.initContract();  
    },

    initContract: function() { 
      App.contracts.RushCon = new App.web3.eth.Contract(App.abi,App.address, {});   
      return App.bindEvents();
    },  
  
    bindEvents: function() {  
      $(document).on('click', '#userReg', function(){
         App.handleUserRegistration(jQuery('#userIdentity').val());
      });

      $(document).on('click', '#channelReg', function(){
        App.handleChannelRegistration(jQuery('#userIdentity').val());
      });
  
      $(document).on('click', '#unReg', function(){
        App.handleUnRegistration(jQuery('#cenIdentity').val());
      });
      $(document).on('click', '#paymentConfirm',function(){
        App.handlePayment(jQuery('#channel').val());
      });
      $(document).on('click', '#getRewards', function(){
        App.handleGet();
      });
      $(document).on('click', '#getBalance', function(){
        App.handleBalance();
      });
      $(document).on('click', '#getList', function(){
        App.handleProviders();
      });
      $(document).on('click', '#payEther', function(){
        App.handleRadioPay();
      });
      $(document).on('click', '#payPoints', function(){
        App.handleRadioPay();
      });
      $(function(){
        const pay = document.getElementById('amountBox');
        const reward = document.getElementById('rewardBox');
        pay.style.display = 'none';
        reward.style.display = 'none';
      });
      App.populateAddress();
    },

    populateAddress : function(){  
      App.handler=App.web3.givenProvider.selectedAddress;
    },  
  
    handleRadioPay:function() {
      const pay = document.getElementById('amountBox');
      const reward = document.getElementById('rewardBox');
      if (document.getElementById('payEther').checked) {
        pay.style.display = 'block';
        reward.style.display = 'none';
        document.getElementById('reward_value').style.display = 'none';
        document.getElementById("paymentConfirm").disabled = false;
      } else {
        pay.style.display = 'none';
        reward.style.display = 'block';
        document.getElementById('reward_value').style.display = 'none';
        document.getElementById('amount').value = "";
      }
    },
    handleUserRegistration:function(userAddress){
      if (userAddress===''){
        alert("Please enter a valid user address.")
        return false
      }
      var option={from:App.handler}    
      App.contracts.RushCon.methods.registerUser(userAddress)
      .send(option)
      .on('receipt',(receipt)=>{
        if(receipt.status){
          toastr.success("User is registered successfully " + userAddress);
      }})
      .on('error',(err)=>{
        toastr.error("User registration is unsuccessful");
      })
    },

    handleChannelRegistration:function(channelAddress){
      if (channelAddress===''){
        alert("Please enter a valid user address.")
        return false
      }
      var option={from:App.handler}    
      App.contracts.RushCon.methods.registerProvider(channelAddress)
      .send(option)
      .on('receipt',(receipt)=>{
        if(receipt.status){
          toastr.success("Channel is registered successfully " + channelAddress);
      }})
      .on('error',(err)=>{
        toastr.error("Channel registration is unsuccessful");
      })
    },

    handleUnRegistration:function(inputAddress){
      if (inputAddress===''){
        alert("Please enter a valid address.")
        return false
      }
      var option={from:App.handler}    
      App.contracts.RushCon.methods.unregister(inputAddress)
      .send(option)
      .on('receipt',(receipt)=>{
        if(receipt.status){
          toastr.success("Address is unregistered successfully " + inputAddress);
          var select=document.getElementById('channel');
          for (i=0; i<select.length; i++) {
            if (select.options[i].value== inputAddress) {
              select.remove(i);
            }
          }
      }})
      .on('error',(err)=>{
        toastr.error("Address unregistration is unsuccessful");
      })
    },
    handlePayment:function(channelAddress){
      if (channelAddress===''){
        alert("Please enter a valid address.")
        return false
      }
      if(document.getElementById('payPoints').checked &&  jQuery('#reward_value').val() < 10){
        alert("Insufficient reward points. Minimum required points is 100. Please pay using Ethers");
        return;
      }
      var option={from:App.handler, value: jQuery('#amount').val()}    
      App.contracts.RushCon.methods.confirmPayment(channelAddress)
      .send(option)
      .on('receipt',(receipt)=>{
        if(receipt.status){
          toastr.success("Payment is successful" + channelAddress);
          if(document.getElementsByName('sports') == 1){
            window.open('https://youtu.be/CGFgHjeEkbY', '_blank');
          }else{
            window.open('https://youtu.be/jQ1l5zenaKY', '_blank');
          }
      }})
      .on('error',(err)=>{
        toastr.error("Payment is unsuccessful");
      })
    },

    handleGet:function(){
      var option={from:App.handler}
      document.getElementById('reward_value').style.display = 'block';
      App.contracts.RushCon.methods.viewRewards()
      .call(option)
      .then((r)=>{
        jQuery('#reward_value').text(r)
        jQuery('#reward_value').val(r)
      })
    },
    handleBalance:function(){
      App.contracts.RushCon.methods.viewBalance()
      .call()
      .then((r)=>{
        jQuery('#contract_bal').text(r)
      })
    },
    handleProviders:function(){
      var array = new Array();
      App.contracts.RushCon.methods.getProviders()
      .call()
      .then((r)=>{
        jQuery.extend(array, r)
        var select = document.getElementById("channel");
        for(var i = 0; i < array.length; i++) {
          var opt = array[i];
          var el = document.createElement("option");
          el.textContent = "Channel " + (i+1);
          el.value = opt;
          select.appendChild(el);
        }
        const options = []

        document.querySelectorAll('#channel > option').forEach((option) => {
          if (options.includes(option.value)) option.remove()
          else options.push(option.value)
        })
      })
    },     
  abi:[
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "user",
          "type": "address"
        }
      ],
      "name": "registerUser",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "provider",
          "type": "address"
        }
      ],
      "name": "registerProvider",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getProviders",
      "outputs": [
        {
          "internalType": "address[]",
          "name": "",
          "type": "address[]"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "member",
          "type": "address"
        }
      ],
      "name": "unregister",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "viewBalance",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [],
      "name": "viewRewards",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "internalType": "address payable",
          "name": "channel",
          "type": "address"
        }
      ],
      "name": "confirmPayment",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function",
      "payable": true
    }
  ]

  }
  
  $(function() {
    $(window).load(function() {
      App.init();
      toastr.options = {
          "closeButton": true,
          "debug": false,
          "newestOnTop": false,
          "progressBar": false,
          "positionClass": "toast-bottom-full-width",
          "preventDuplicates": false,
          "onclick": null,
          "showDuration": "300",
          "hideDuration": "1000",
          "timeOut": "5000",
          "extendedTimeOut": "1000",
          "showEasing": "swing",
          "hideEasing": "linear",
          "showMethod": "fadeIn",
          "hideMethod": "fadeOut"
      };
    });
  });
  
