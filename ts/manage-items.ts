import { Item } from "./dto/item";
import $ from "jquery";
import { Pagination } from "./pagination";
import Big from "big.js";

console.log("Working");

// const BASE_API = 'https://bc677221-4831-4411-b038-9e174414f8ff.mock.pstmn.io';
const BASE_API = "http://localhost:8080/pos";
const ITEMS_SERVICE_API = `${BASE_API}/items`;
const PAGE_SIZE = 6;
const PAGINATION = new Pagination($(".pagination"), PAGE_SIZE, 0, loadAllItems);

let items: Array<Item> = [];
let totalItems = 0;
//localhost:1234/Items.html
http: loadAllItems();

/* Event listners */

$("#btn-save").on("click", (eventData) => {
  eventData.preventDefault();

  const txtCode = $("#txt-code");
  const txtDescription = $("#txt-description");
  const nmbUnitPrice = $("#nmb-unitPrice");
  const nmbQtyOnHand = $("#nmb-qtyOnHand");

  let code = (txtCode.val() as string).trim();
  let description = (txtDescription.val() as string).trim();
  let unitPrice = new Big(nmbUnitPrice.val() as number);
  let qtyOnHand = nmbQtyOnHand.val() as number;

  let validated = true;
  $("#txt-code, #txt-description, #nmb-unitPrice, #nmb-qtyOnHand").removeClass(
    "is-invalid"
  );

  if (qtyOnHand < 0) {
    nmbQtyOnHand.addClass("is-invalid");
    nmbQtyOnHand.trigger("select");
    validated = false;
  }

  if (unitPrice.cmp(new Big(0)) <= 0) {
    nmbUnitPrice.addClass("is-invalid");
    nmbUnitPrice.trigger("select");
    validated = false;
  }

  if (description === null) {
    txtDescription.addClass("is-invalid");
    txtDescription.trigger("select");
    validated = false;
  }

  if (!/I\d{3}/.test(code)) {
    txtCode.addClass("is-invalid");
    txtCode.trigger("select");
    validated = false;
  }

  if (!validated) return;

  if (txtCode.attr("disabled")) {
    const selectedRow = $("#tbl-items tbody tr.selected");
    updateItem(new Item(code, description, unitPrice, qtyOnHand));
    return;
  }

  saveItem(new Item(code, description, unitPrice, qtyOnHand));
});

$("#tbl-items tbody").on("click", "tr", function () {
  const code = $(this).find("td:first-child").text();
  const description = $(this).find("td:nth-child(2)").text();
  let unitPrice = new Big($(this).find("td:nth-child(4)").text());
  let qtyOnHand = $(this).find("td:nth-child(3)").text();

  $("#txt-code").val(code).attr("disabled", "true");
  $("#txt-description").val(description);
  $("#nmb-unitPrice").val(unitPrice.valueOf());
  $("#nmb-qtyOnHand").val(qtyOnHand);

  $("#tbl-items tbody tr").removeClass("selected");
  $(this).addClass("selected");
});

$("#tbl-items tbody").on("click", ".trash", function (eventData) {
  if (confirm("Are you sure to delete?")) {
    deleteItem($(eventData.target).parents("tr").find("td:first-child").text());
  }
});

$("#btn-clear").on("click", () => {
  $("#tbl-items tbody tr.selected").removeClass("selected");
  $("#txt-code").removeAttr("disabled").trigger("focus");
});

//API Calls
function loadAllItems(): void {
  const http = new XMLHttpRequest();

  http.onreadystatechange = () => {
    if (http.readyState === http.DONE) {
      if (http.status !== 200) {
        alert("Failed to fetch items, try again...!");
        return;
      }

      totalItems = +http.getResponseHeader("X-Total-Count");
      items = JSON.parse(http.responseText);

      $("#tbl-items tbody tr").remove();
      console.log(items);

      items.forEach((i) => {
        const rowHtml = `<tr>
               <td>${i.code}</td>
               <td>${i.description}</td>
               <td>${i.qtyOnHand}</td>
               <td>${i.unitPrice}</td>
               <td><i class="fas fa-trash trash"></i></td>
               </tr>`;

        $("#tbl-items tbody").append(rowHtml);
      });

      PAGINATION.reInitialize(totalItems, PAGINATION.selectedPage);
    }
  };

  // http://url?page=10&size=10
  http.open(
    "GET",
    ITEMS_SERVICE_API + `?page=${PAGINATION.selectedPage}&size=${PAGE_SIZE}`,
    true
  );

  // 4. Setting headers, etc.

  http.send();
}

function saveItem(item: Item): void {
  console.log(item);

  const http = new XMLHttpRequest();

  http.onreadystatechange = () => {
    if (http.readyState !== http.DONE) return;

    if (http.status !== 201) {
      console.error(http.responseText);
      alert("Failed to save the item, retry");
      return;
    }

    alert("Item has been saved successfully");

    totalItems++;
    PAGINATION.pageCount = Math.ceil(totalItems / PAGE_SIZE);
    PAGINATION.navigateToPage(PAGINATION.pageCount);
    $("#txt-code, #txt-description, #txt-unitiPrice, #txt-qtyOnHand").val("");
    $("#txt-code").trigger("focus");
  };

  http.open("POST", ITEMS_SERVICE_API, true);

  http.setRequestHeader("Content-Type", "application/json");

  http.send(JSON.stringify(item));
}

function updateItem(item: Item): void {
  const http = new XMLHttpRequest();

  http.onreadystatechange = () => {
    if (http.readyState !== http.DONE) return;

    if (http.status !== 204) {
      alert("Failed to update the item, retry");
      return;
    }

    alert("Item has been updated successfully");
    $("#tbl-items tbody tr.selected")
      .find("td:nth-child(2)")
      .text($("#txt-description").val());
    $("#tbl-items tbody tr.selected")
      .find("td:nth-child(3)")
      .text($("#nmb-qtyOnHand").val());
    $("#tbl-items tbody tr.selected")
      .find("td:nth-child(4)")
      .text($("#nmb-unitPrice").val());
    $("#txt-code, #txt-description, #nmb-unitPrice, #nmb-qtyOnHand").val("");
    $("#txt-code").trigger("focus");
    $("#tbl-items tbody tr.selected").removeClass("selected");
    $("#txt-code").removeAttr("disabled");
  };

  http.open("PUT", ITEMS_SERVICE_API, true);

  http.setRequestHeader("Content-Type", "application/json");

  http.send(JSON.stringify(item));
}

function deleteItem(code: string): void {
  // fetch(ITEMS_SERVICE_API + `?${new URLSearchParams({ code: code })}`, {
  //   method: "DELETE",
  // })
  //   .then((response) => {
  //     if (response.status !== 204)
  //       throw new Error("Failed to delete the item, try again");

  //     totalItems--;
  //     PAGINATION.pageCount = Math.ceil(totalItems / PAGE_SIZE);
  //     PAGINATION.navigateToPage(PAGINATION.pageCount);

  //     $("#btn-clear").trigger("click");
  //   })
  //   .catch((err) => {
  //     alert(err.message);
  //     console.error(err);
  //   });

  const http = new XMLHttpRequest();

  http.onreadystatechange = () => {
    if (http.readyState === http.DONE) {
      if (http.status !== 204) {
        console.log(http.status);

        alert("Failed to delete item, try again...!");
        return;
      }

      totalItems--;
      PAGINATION.pageCount = Math.ceil(totalItems / PAGE_SIZE);
      PAGINATION.navigateToPage(PAGINATION.pageCount);

      $("#btn-clear").trigger("click");
    }
  };

  http.open("DELETE", ITEMS_SERVICE_API + `?code=${code}`, true);

  http.send();
}
