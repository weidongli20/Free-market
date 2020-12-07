import markJson from "./build/contracts/FreeMarket.json";
import auctionJson from "./build/contracts/fmAuction.json";

const Web3 = require("web3");

//const contractAddress = "0x9b91Dd4F2B413709eaD9E6F9e396cf321d4DDB6d"; // kovan
const contractAddress = "0x5fAc2df30a6C3350c7c79E8522A2324460d4C545"; // local

const dApp = {
  ethEnabled: function() {
    // If the browser has injected Web3.js
    if (window.web3) {
      // Then replace the old injected version by the latest build of Web3.js version 1.0.0
      window.web3 = new Web3(window.web3.currentProvider);
      window.ethereum.enable();
      return true;
    }
    return false;
  },
  init: async function() {
    if (!this.ethEnabled()) {
      alert("Please install MetaMask to use this dApp!");
    }
    this.accounts = await window.web3.eth.getAccounts();
    this.contractAddress = contractAddress;
    this.markContract = new window.web3.eth.Contract(
      markJson.abi,
      this.contractAddress,
      { defaultAccount: this.accounts[0] }
    );
    this.isAdmin = this.accounts[0] == await this.markContract.methods.owner().call();
    console.log("Contract object", this.markContract);
  },
  collectVars: async function() {
    // get product tokens
    this.tokens = [];
    this.totalSupply = await this.markContract.methods.totalSupply().call();
    for (let i = 0; i < this.totalSupply; i++) {
      this.tokens.push({
        tokenId: i,
        highestBid: Number(await this.markContract.methods.highestBid(i).call()),
        auctionEnded: Boolean(await this.markContract.methods.auctionEnded(i).call()),
        pendingReturn: Number(await this.markContract.methods.pendingReturn(i, this.accounts[0]).call()),
        auction: new window.web3.eth.Contract(
          auctionJson.abi,
          await this.markContract.methods.getAuction(i).call(),
          { defaultAccount: this.accounts[0] }
        ),
        owner: await this.markContract.methods.ownerOf(i).call(),
        ...JSON.parse(await this.markContract.methods.tokenURI(i).call())
      });
    }
  },
  setAdmin: async function() {
    // if account selected in MetaMask is the same as owner then admin will show
    if (this.isAdmin) {
      $(".dapp-admin").show();
    } else {
      $(".dapp-admin").hide();
    }
  },
  updateUI: async function() {
    console.log("updating UI");
    //
    const renderItem1 = (id, icon_class) => `
      <li>
        <div class="collapsible-header dapp-admin"><i class="${icon_class}"></i>History Report</div>
        <div class="collapsible-body" id="log">
        </div>
      </li>
    `;     
    const renderItemHead = (id, icon_class) => `
      <li>
        <div class="collapsible-header"><i class="${icon_class}"></i>Bidding Report ${id}</div>
        <div class="collapsible-body">
    `;  
    const renderItem = (uri) => `
            <h6>Description</h6>
            <p>${uri}</p>
            <p><a href="uri">Reference URI</a></p>
    `;
    const renderItemTail = () => `
        </div>    
      </li>
    `; 
    const str3 = ``;
    // fetch json metadata from IPFS (name, description, image, etc)
    //const fetchMetadata = (reference_uri) => fetch(`https://gateway.pinata.cloud/ipfs/${reference_uri.replace("ipfs://", "")}`, { mode: "cors" }).then((resp) => resp.json());
    //$("#dapp-history").append(renderItem1("","fab fa-osi"));

      //fetchMetadata(reference_uri)
      //.then((json) => {
    //$("#dapp-hist").append(renderItem("fab fa-osi"));
      //});
    //});

    // refresh variables
    await this.collectVars();
    //
    $("#dapp-history").html("");
    $("#dapp-history").append(renderItem1("","fab fa-osi"));
    var str = `
    <li>
      <div class="collapsible-header"><i class="fab fa-osi"></i>Bid Report</div>
      <div class="collapsible-body" >`;  
    var str2 = ``;
    this.tokens.forEach((token) => {
      //global.globalString = "test";
      token.auction.events.HighestBidIncreased({fromBlock: 0}, (err, event) => {

        //const {id, uri} = event.returnValues;
        //console.log(event.returnValues);
        M.toast({ html: event.returnValues[0]});
        var str = `
        <li> Bidder: ${event.returnValues[0]}; Amount: ${event.returnValues[1]} </li>
        `;
        $("#log").append(str);
        //$("#dapp-history").innerHTML=renderItem1(event.returnValues[0],"fab fa-osi");
        //global.globalString = "t";
        //str2 += renderItem("");
        //str2 += `<p>${event.returnValues[1]}</p>`;
        //str3 = renderItem1(event.returnValues[0],"fab fa-osi");
        //return event;
      });
      //str3 += renderItem1(this.totalSupply,"fab fa-osi");
      //var uri ="";
      //var uri = evt;
      //var uri ="";
      //var uri = evt.raw.data;
      //var evts = await token.auction.getPastEvents();
      str2 += `<p>Product:${token.name}, Highest bid: ${token.highestBid}</p>`;
      //str2 += `<p>${id}</p>`;
    });
    //$("#dapp-history").append(str3);
    str += str2;
    str += renderItemTail();
    $("#dapp-hist").html("");
    $("#dapp-hist").append(str);

    //
    $("#dapp-tokens").html("");
    //$("#dapp-hist").html("");
    this.tokens.forEach((token) => {
      let endAuction = `<a id="${token.tokenId}" class="dapp-admin" style="display:none;" href="#" onclick="window.dApp.endAuction(event)">End Sale</a>`;
      let bid = `<a id="${token.tokenId}" href="#" onclick="window.dApp.bid(event);">Bid</a>`;
      let owner = `Owner: ${token.owner}`;
      let withdraw = `<a id="${token.tokenId}" href="#" onclick="window.dApp.withdraw(event)">Withdraw</a>`
      let pendingWithdraw = `Balance: ${token.pendingReturn} wei`;
      //let bidhist = renderItem("fab fa-osi");
      // fetch the OpenSource Events from the contract and append them to the UI list
      //
        $("#dapp-tokens").append(
          `<div class="col m6">
            <div class="card">
              <div class="card-image">
                <img style="height:400px; width:100%" id="dapp-image" src="${token.image}">
                <span id="dapp-name" class="card-title">${token.name}</span>
              </div>
              <div class="card-action">
                <input type="number" min="${token.highestBid + 1}" name="dapp-wei" value="${token.highestBid + 1}" ${token.auctionEnded ? 'disabled' : ''}>
                ${token.auctionEnded ? owner : bid}
                ${token.pendingReturn > 0 ? withdraw : ''}
                ${token.pendingReturn > 0 ? pendingWithdraw : ''}
                ${this.isAdmin && !token.auctionEnded ? endAuction : ''}
              </div>
            </div>
          </div>`
        );
        //$("#dapp-hist").append(renderItem("fab fa-osi")); 
    });

    // hide or show admin functions based on contract ownership
    await this.setAdmin();
  },
  bid: async function(event) {
    const tokenId = $(event.target).attr("id");
    const wei = Number($(event.target).prev().val());
    await this.markContract.methods.bid(tokenId).send({from: this.accounts[0], value: wei}, async () => {
      await this.updateUI();
    });
  },
  endAuction: async function(event) {
    const tokenId = $(event.target).attr("id");
    await this.markContract.methods.endAuction(tokenId).send({from: this.accounts[0]}, async () => {
      await this.updateUI();
    });
  },
  withdraw: async function(event) {
    const tokenId = $(event.target).attr("id");
    await this.tokens[tokenId].auction.methods.withdraw().send({from: this.accounts[0]}, async () => {
      await this.updateUI();
    });
  },
  registerProduct: async function() {
    const tokenURI = {
      name: $("#dapp-register-name").val(),
      image: $("#dapp-register-image").val()
    };

    await this.markContract.methods.registerProduct(JSON.stringify(tokenURI)).send({from: this.accounts[0]}, async () => {
      $("#dapp-register-name").val("");
      $("#dapp-register-image").val("");
      await this.updateUI();
    });
  },
  main: async function() {
    // Initialize web3
    await this.init();
    await this.updateUI();
  }
};

window.dApp = dApp;
window.dApp.main();
