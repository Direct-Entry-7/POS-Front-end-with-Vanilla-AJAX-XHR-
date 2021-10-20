import { Customer } from "./dto/customer";
import $ from "jquery";
import { Pagination } from "./pagination";

// const BASE_API = 'https://bc677221-4831-4411-b038-9e174414f8ff.mock.pstmn.io';
const BASE_API = "http://localhost:8080/pos";
const CUSTOMERS_SERVICE_API = `${BASE_API}/customers`;
const PAGE_SIZE = 6;
const PAGINATION = new Pagination(
  $(".pagination"),
  PAGE_SIZE,
  0,
  loadAllCustomers
);

let customers: Array<Customer> = [];
let totalCustomers = 0;

loadAllCustomers();

/* Event Listeners */

$("#btn-save").on("click", (eventData) => {
  eventData.preventDefault();

  const txtId = $("#txt-id");
  const txtName = $("#txt-name");
  const txtAddress = $("#txt-address");

  let id = (txtId.val() as string).trim();
  let name = (txtName.val() as string).trim();
  let address = (txtAddress.val() as string).trim();

  let validated = true;
  $("#txt-id, #txt-name, #txt-address").removeClass("is-invalid");

  if (address.length < 3) {
    txtAddress.addClass("is-invalid");
    txtAddress.trigger("select");
    validated = false;
  }

  if (!/^[A-Za-z ]+$/.test(name)) {
    txtName.addClass("is-invalid");
    txtName.trigger("select");
    validated = false;
  }

  if (!/^C\d{3}$/.test(id)) {
    txtId.addClass("is-invalid");
    txtId.trigger("select");
    validated = false;
  }

  if (!validated) return;

  if (txtId.attr("disabled")) {
    const selectedRow = $("#tbl-customers tbody tr.selected");
    updateCustomer(new Customer(id, name, address));
    return;
  }

  saveCustomer(new Customer(id, name, address));
});

$("#tbl-customers tbody").on("click", "tr", function () {
  const id = $(this).find("td:first-child").text();
  const name = $(this).find("td:nth-child(2)").text();
  const address = $(this).find("td:nth-child(3)").text();

  $("#txt-id").val(id).attr("disabled", "true");
  $("#txt-name").val(name);
  $("#txt-address").val(address);

  $("#tbl-customers tbody tr").removeClass("selected");
  $(this).addClass("selected");
});

$("#tbl-customers tbody").on("click", ".trash", function (eventData) {
  if (confirm("Are you sure to delete?")) {
    deleteCustomer(
      $(eventData.target).parents("tr").find("td:first-child").text()
    );
  }
});

$("#btn-clear").on("click", () => {
  $("#tbl-customers tbody tr.selected").removeClass("selected");
  $("#txt-id").removeAttr("disabled").trigger("focus");
});

/* API Calls */

function loadAllCustomers(): void {
  fetch(
    CUSTOMERS_SERVICE_API +
      "?" +
      new URLSearchParams({
        page: PAGINATION.selectedPage + "",
        size: PAGE_SIZE + "",
      })
  )
    .then((response) => {
      if (response.status !== 200)
        throw new Error("Failed to load customers, try again");

      totalCustomers = +response.headers.get("X-Total-Count");
      return response.json();
    })
    .then((data) => {
      customers = data;

      $("#tbl-customers tbody tr").remove();

      customers.forEach((c) => {
        const rowHtml = `<tr>
                <td>${c.id}</td>
                <td>${c.name}</td>
                <td>${c.address}</td>
                <td><i class="fas fa-trash trash"></i></td>
                </tr>`;

        $("#tbl-customers tbody").append(rowHtml);
      });

      PAGINATION.reInitialize(totalCustomers, PAGINATION.selectedPage);
    })
    .catch((err) => {
      alert(err.message);
      console.log(err);
    });

  // $.get(CUSTOMERS_SERVICE_API, { page: PAGINATION.selectedPage, size: PAGE_SIZE }).done((data, statusText, xhr) => {
  //     customers = data;
  //     totalCustomers = +xhr.getResponseHeader("X-Total-Count");

  //     $('#tbl-customers tbody tr').remove();

  //     customers.forEach((c) => {
  //         const rowHtml = `<tr>
  //             <td>${c.id}</td>
  //             <td>${c.name}</td>
  //             <td>${c.address}</td>
  //             <td><i class="fas fa-trash trash"></i></td>
  //             </tr>` ;

  //         $('#tbl-customers tbody').append(rowHtml);
  //     });

  //     PAGINATION.reInitialize(totalCustomers, PAGINATION.selectedPage);
  // }).fail((xhr) => {
  //     alert("Failed to load customers");
  //     console.error(xhr.responseText);
  // });

  // $.ajax(CUSTOMERS_SERVICE_API + `?page=${selectedPage}&size=${PAGE_SIZE}`, {
  //     method: 'GET'
  // }).then((data)=>{
  //     customers = data;

  //     $('#tbl-customers tbody tr').remove();

  //     customers.forEach((c) => {
  //         const rowHtml = `<tr>
  //             <td>${c.id}</td>
  //             <td>${c.name}</td>
  //             <td>${c.address}</td>
  //             <td><i class="fas fa-trash trash"></i></td>
  //             </tr>` ;

  //         $('#tbl-customers tbody').append(rowHtml);
  //     });

  //     initPagination();
  // }).catch((err)=>{
  //     alert("Failed to fetch customers...!");
  //     console.log(err);
  // });

  // const http = new XMLHttpRequest();

  // http.onreadystatechange = () => {

  //     if (http.readyState === http.DONE) {

  //         if (http.status !== 200) {
  //             alert("Failed to fetch customers, try again...!");
  //             return;
  //         }

  //         totalCustomers = +(http.getResponseHeader('X-Total-Count'));
  //         customers = JSON.parse(http.responseText);

  //         $('#tbl-customers tbody tr').remove();

  //         customers.forEach((c) => {
  //             const rowHtml = `<tr>
  //              <td>${c.id}</td>
  //              <td>${c.name}</td>
  //              <td>${c.address}</td>
  //              <td><i class="fas fa-trash trash"></i></td>
  //              </tr>` ;

  //             $('#tbl-customers tbody').append(rowHtml);
  //         });

  //         initPagination();

  //     }

  // };

  // // http://url?page=10&size=10
  // http.open('GET', CUSTOMERS_SERVICE_API + `?page=${selectedPage}&size=${PAGE_SIZE}`, true);

  // // 4. Setting headers, etc.

  // http.send();
}

function saveCustomer(customer: Customer): void {
  fetch(CUSTOMERS_SERVICE_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(customer),
  })
    .then((response) => {
      if (response.status !== 201)
        throw new Error("Failed to save the customer, try again");

      alert("Customer has been saved successfully");

      totalCustomers++;
      PAGINATION.pageCount = Math.ceil(totalCustomers / PAGE_SIZE);
      PAGINATION.navigateToPage(PAGINATION.pageCount);

      $("#txt-id, #txt-name, #txt-address").val("");
      $("#txt-id").trigger("focus");
    })
    .catch((err) => {
      alert(err.message);
      console.log(err);
    });

  // $.ajax(CUSTOMERS_SERVICE_API, {
  //     method: 'POST',
  //     contentType: 'application/json',
  //     data: JSON.stringify(customer)
  // }).then(() => {
  //     alert("Customer has been saved successfully");

  //     totalCustomers++;
  //     PAGINATION.pageCount = Math.ceil(totalCustomers / PAGE_SIZE);
  //     PAGINATION.navigateToPage(PAGINATION.pageCount);

  //     $('#txt-id, #txt-name, #txt-address').val('');
  //     $('#txt-id').trigger('focus');
  // }).catch((xhr) => {
  //     alert("Failed to save the customer");
  //     console.error((xhr as any).responseText);
  // });

  // const http = new XMLHttpRequest();

  // http.onreadystatechange = () => {

  //     if (http.readyState !== http.DONE) return;

  //     if (http.status !== 201) {
  //         console.error(http.responseText);
  //         alert("Failed to save the customer, retry");
  //         return;
  //     }

  //     alert("Customer has been saved successfully");

  //     totalCustomers++;
  //     pageCount = Math.ceil(totalCustomers / PAGE_SIZE);

  //     navigateToPage(pageCount);
  //     $('#txt-id, #txt-name, #txt-address').val('');
  //     $('#txt-id').trigger('focus');
  // };

  // http.open('POST', CUSTOMERS_SERVICE_API, true);

  // http.setRequestHeader('Content-Type', 'application/json');

  // http.send(JSON.stringify(customer));
}

function updateCustomer(customer: Customer): void {
  fetch(CUSTOMERS_SERVICE_API, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(customer),
  })
    .then((response) => {
      if (response.status !== 204)
        throw new Error("Failed to update the customer, try again");

      alert("Customer has been updated successfully");
      $("#tbl-customers tbody tr.selected")
        .find("td:nth-child(2)")
        .text($("#txt-name").val() as string);
      $("#tbl-customers tbody tr.selected")
        .find("td:nth-child(3)")
        .text($("#txt-address").val() as string);
      $("#txt-id, #txt-name, #txt-address").val("");
      $("#txt-id").trigger("focus");
      $("#tbl-customers tbody tr.selected").removeClass("selected");
      $("#txt-id").removeAttr("disabled");
    })
    .catch((err) => {
      alert(err.message);
      console.error(err);
    });

  // $.ajax(CUSTOMERS_SERVICE_API, {
  //     method: 'PUT',
  //     contentType: 'application/json',
  //     data: JSON.stringify(customer)
  // }).then(() => {
  //     alert("Customer has been updated successfully");
  //     $("#tbl-customers tbody tr.selected").find("td:nth-child(2)").text($("#txt-name").val());
  //     $("#tbl-customers tbody tr.selected").find("td:nth-child(3)").text($("#txt-address").val());
  //     $('#txt-id, #txt-name, #txt-address').val('');
  //     $('#txt-id').trigger('focus');
  //     $("#tbl-customers tbody tr.selected").removeClass('selected');
  //     $('#txt-id').removeAttr('disabled');
  // }).catch((xhr) => {
  //     alert("Failed to update the customer, try again");
  //     console.error((xhr as XMLHttpRequest).responseText);
  // });

  // const http = new XMLHttpRequest();

  // http.onreadystatechange = () => {

  //     if (http.readyState !== http.DONE) return;

  //     if (http.status !== 204) {
  //         alert("Failed to update the customer, retry");
  //         return;
  //     }

  //     alert("Customer has been updated successfully");
  //     $("#tbl-customers tbody tr.selected").find("td:nth-child(2)").text($("#txt-name").val());
  //     $("#tbl-customers tbody tr.selected").find("td:nth-child(3)").text($("#txt-address").val());
  //     $('#txt-id, #txt-name, #txt-address').val('');
  //     $('#txt-id').trigger('focus');
  //     $("#tbl-customers tbody tr.selected").removeClass('selected');
  //     $('#txt-id').removeAttr('disabled');

  // };

  // http.open('PUT', CUSTOMERS_SERVICE_API, true);

  // http.setRequestHeader('Content-Type', 'application/json');

  // http.send(JSON.stringify(customer));
}

function deleteCustomer(id: string): void {
  fetch(CUSTOMERS_SERVICE_API + `?${new URLSearchParams({ id: id })}`, {
    method: "DELETE",
  })
    .then((response) => {
      if (response.status !== 204)
        throw new Error("Failed to delete the customer, try again");

      totalCustomers--;
      PAGINATION.pageCount = Math.ceil(totalCustomers / PAGE_SIZE);
      PAGINATION.navigateToPage(PAGINATION.pageCount);

      $("#btn-clear").trigger("click");
    })
    .catch((err) => {
      alert(err.message);
      console.error(err);
    });

  // $.ajax(CUSTOMERS_SERVICE_API + `?id=${id}`, {
  //     method: 'DELETE'
  // }).then(() => {
  //     totalCustomers--;
  //     PAGINATION.pageCount = Math.ceil(totalCustomers / PAGE_SIZE);
  //     PAGINATION.navigateToPage(PAGINATION.pageCount);

  //     $("#btn-clear").trigger('click');
  // }).catch((xhr) => {
  //     alert("Failed to delete the customer, try again");
  //     console.error((xhr as XMLHttpRequest).responseText);
  // });

  // const http = new XMLHttpRequest();

  // http.onreadystatechange = () => {

  //     if (http.readyState === http.DONE) {

  //         if (http.status !== 204) {
  //             alert("Failed to delete customer, try again...!");
  //             return;
  //         }

  //         totalCustomers--;
  //         pageCount = Math.ceil(totalCustomers / PAGE_SIZE);
  //         navigateToPage(pageCount);

  //     }

  // };

  // http.open('DELETE', CUSTOMERS_SERVICE_API + `?id=${id}`, true);

  // http.send();
}
