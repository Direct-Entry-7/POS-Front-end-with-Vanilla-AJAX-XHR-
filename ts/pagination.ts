export class Pagination {
  pageCount: number = 1;

  constructor(
    private elm: JQuery,
    public pageSize: number = 6,
    public totalRecords: number,
    private callFn: Function,
    public selectedPage: number = 1
  ) {
    this.reInitialize(totalRecords, selectedPage, pageSize);
  }

  reInitialize(
    totalRecords: number,
    selectedPage: number = 1,
    pageSize: number = 6
  ): void {
    this.pageCount = Math.ceil(totalRecords / pageSize);

    this.showOrHidePagination();
    if (this.pageCount <= 1) return;

    let html = `<li class="page-item"><a class="page-link" href="#!">«</a></li>`;

    for (let i = 0; i < this.pageCount; i++) {
      html += `<li class="page-item ${
        selectedPage === i + 1 ? "active" : ""
      }"><a class="page-link" href="javascript:void(0);">${i + 1}</a></li>`;
    }

    html += `<li class="page-item"><a class="page-link" href="javascript:void(0);">»</a></li>`;

    this.elm.html(html);

    if (selectedPage === 1) {
      this.elm.find(".page-item:first-child").addClass("disabled");
    } else if (selectedPage === this.pageCount) {
      this.elm.find(".page-item:last-child").addClass("disabled");
    }

    this.elm
      .find(".page-item:first-child")
      .on("click", () => this.navigateToPage(selectedPage - 1));
    this.elm
      .find(".page-item:last-child")
      .on("click", () => this.navigateToPage(selectedPage + 1));

    const self = this;

    this.elm
      .find(".page-item:not(.page-item:first-child, .page-item:last-child)")
      .on("click", function () {
        self.navigateToPage(+$(this).text());
      });
  }

  private showOrHidePagination(): void {
    this.pageCount > 1 ? this.elm.show() : this.elm.hide();
  }

  navigateToPage(page: number): void {
    if (page < 1 || page > this.pageCount) return;

    this.selectedPage = page;
    this.callFn();
  }
}
