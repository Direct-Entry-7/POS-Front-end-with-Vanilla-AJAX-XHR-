import { Order } from "./dto/order";
import { Pagination } from "./pagination";

// const BASE_API = 'https://bc677221-4831-4411-b038-9e174414f8ff.mock.pstmn.io';
const BASE_API = "http://localhost:8080/pos";
const ORDERS_SERVICE_API = `${BASE_API}/orders`;
const PAGE_SIZE = 3;
const PAGINATION = new Pagination($(".pagination"), PAGE_SIZE, 0, searchOrders);

searchOrders();

/* Event Listeners */

$("#btn-search").on("click", (eventData) => {
  eventData.preventDefault();
  searchOrders();
});

$("#txt-search").on("input", () => {
  searchOrders();
});

/* API Calls */

function searchOrders(): void {
  fetch(
    ORDERS_SERVICE_API +
      `?${new URLSearchParams({
        page: PAGINATION.selectedPage + "",
        size: PAGE_SIZE + "",
        q: $("#txt-search").val() + "",
      })}`
  )
    .then((response) => {
      if (response.status !== 200)
        throw new Error("Someting went wrong, please try again");

      const count = +response.headers.get("X-Total-Count");
      PAGINATION.reInitialize(count, PAGINATION.selectedPage, PAGE_SIZE);

      return response.json();
    })
    .then((data) => {
      $("#tbl-orders tbody tr").remove();

      const orders: Array<Order> = data;

      orders.forEach((o) => {
        const rowHtml = `<tr>
                <td>${o.orderId}</td>
                <td>${o.orderDate}</td>
                <td>${o.customerId}</td>
                <td>${o.customerName}</td>
                <td>${o.orderTotal.toFixed(2)}</td>
            </tr>`;

        $("#tbl-orders tbody").append(rowHtml);
      });
    })
    .catch((err) => {
      alert(err.message);
      console.log(err);
    });

  // $.get(ORDERS_SERVICE_API, { page: PAGINATION.selectedPage, size: PAGE_SIZE, q: $("#txt-search").val() })
  //     .then((data, statusText, xhr) => {

  //         $("#tbl-orders tbody tr").remove();

  //         const orders: Array<Order> = data;

  //         orders.forEach((o) => {

  //             const rowHtml = `<tr>
  //             <td>${o.orderId}</td>
  //             <td>${o.orderDate}</td>
  //             <td>${o.customerId}</td>
  //             <td>${o.customerName}</td>
  //             <td>${o.orderTotal.toFixed(2)}</td>
  //         </tr>`;

  //             $("#tbl-orders tbody").append(rowHtml);

  //         });

  //         PAGINATION.reInitialize(+xhr.getResponseHeader('X-Total-Count'),PAGINATION.selectedPage, PAGE_SIZE);

  //     }).catch((xhr) => {
  //         alert("Failed to search, something is wrong");
  //         console.error((xhr as XMLHttpRequest).responseText);
  //     });
}
