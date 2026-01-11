/*
@description: This component is used to display a list of records in a table format.
@author: Avik Shaw
@version: 1.0
@date: 2026-01-11
*/
import { LightningElement, api, track, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from 'lightning/navigation';

export default class UnrelatedList extends NavigationMixin(LightningElement) {
    @api records;
    @api layoutFields;
    @api iconName;
    @api title;
    @api pageSize;
    @api isSalesforceData;
    @api hoverColumns;
    @track sortedData;
    @track currentData;
    @track filteredCurrentdata;
    @track hoverData;
    @track currentPage = 1;
    @track totalPages = 0;
    @track currentData = [];
    @track pageSizeLocal;
    recordsLength;
    showReload;
    isShowTable = false;
    isAscending;
    showHoverOption = false;
    sortField;
    pageSizeOptions = [5, 10, 15, 25, 50, 75, 100]; //Page size options
    tempArr = [];
    pageArray = [];
    selectedcurrrentpage;
    btnclassname = "pagenostyle";

    formatDate = new Intl.DateTimeFormat('en-US', {
        month: 'numeric',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
        timeZone: "America/New_York"
    });

    @track columns = [];

    @track hoverLayoutColumns = [];

    connectedCallback() {
        this.pageSizeLocal = parseInt(this.pageSize);
        if (this.records) {
            this.totalPages = Math.ceil(this.records.length / this.pageSizeLocal);
            try {
                this.records = JSON.parse(JSON.stringify(this.records));
            } catch (error) {
                console.error('Error parsing records', error);
            }
            if (this.records?.length > 0) {
                this.createColumns(this.records);
                this.loadData();
            } else {
                this.isShowTable = false; // Hide loading spinner
            }
        }
    }

    loadData(){
        if(!Array.isArray(this.records)){
            console.error("Source Data is incorrected");
            return;
        }
        this.isShowTable = false;
        this.isAscending = true;
        this.showReload = false;
        this.sortedData = [...this.records];
        setTimeout(() => {
            this.formatData(this.records);
            this.visiblePages();
        }, 100);
    }

    // Utility function to show * messages
    showToast(title, message, variant) {
        const event = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        });
        this.dispatchEvent(event); // Dispatch the * event
    }

    navigateToRecord(event) {
        const caseId = event.currentTarget.dataset.id;
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: caseId,
                actionName: 'view'
            }
        });
    }

    showHoverLayout(event){
        if(this.showHoverOption){
            let rowId = event.currentTarget.dataset.id;
            let hoverEl = this.template.querySelector('.cardBackground[data-id="'+rowId+'"]');
            hoverEl?.classList?.toggle('hidden');
        }
    }

    get hoverClass(){
        return `slds-col slds-size_1-of-${this.hoverLayoutColumns.length - 1} slds-var-p-right_medium`;
    }

    formatData(recdata, isPagination = false){
        if (isPagination !== true) {
            let data = [];
            recdata?.map(row => {
                let hoverDataObj = [];
                this.hoverLayoutColumns.map(col => {
                    let val;
                    if (col.type === 'dateTime') {
                        val = this.formatDate.format(new Date(row[col.fieldName]));
                    } else if (col.fieldName.includes('.')) {
                        let split = col.fieldName.split('.');
                        val = row[split[0]][split[1]];
                    } else {
                        val = row[col.fieldName];
                    }
                    hoverDataObj.push({
                        label: col.label,
                        value: val
                    });
                });
                let dataObj = [];
                this.columns.map(col => {
                    let val;
                    if (col.type === 'dateTime') {
                        val = this.formatDate.format(new Date(row[col.fieldName]));
                    } else if (col.fieldName.includes('.')) {
                        let split = col.fieldName.split('.');
                        val = row[split[0]][split[1]];
                    } else {
                        val = row[col.fieldName];
                    }
                    dataObj.push({
                        label: col.label,
                        value: val,
                        attribute: col.type === 'url' ? row['Id'] : ''
                    });
                });
                data.push({
                    id: row.Id,
                    data: dataObj,
                    subject: hoverDataObj[0]?.value ?? '',
                    hoverData: hoverDataObj?.slice(1)
                })
            }); // Assign the fetched records to the currentData property
            this.currentData = data;
        } else {
            this.currentData = recdata;
        }
        this.sortField = this.columns[0].fieldName;
        this.totalPages = Math.ceil(this.currentData?.length / this.pageSizeLocal);
        const start = (this.currentPage - 1) * this.pageSizeLocal;
        const end = start + this.pageSizeLocal;
        this.filteredCurrentdata = this.currentData.slice(start, end);
        this.isShowTable = true; // Hide loading spinner
    }

    isAscending = true;
    sortColumn(event) {
        let sortField = event.currentTarget.dataset.fieldname;
        let arrowUpEl = this.template.querySelector('.asc[data-fieldname="'+sortField+'"]');
        if(arrowUpEl?.iconName?.includes('arrowup')){
            arrowUpEl.iconName = 'utility:arrowdown';
            this.sortRecords(sortField, false);
        } else {
            arrowUpEl.iconName = 'utility:arrowup';
            this.sortRecords(sortField, true);
        }
    }

    sortRecords(field, isAscending) {
        this.sortedData.sort((a, b) => {
            // equal items sort equally
            if (a[field] === b[field]) {
                return 0;
            }

            // nulls sort after anything else
            if (a[field] == undefined || a[field] === null) {
                return 1;
            }
            if (b[field] == undefined || b[field] === null) {
                return -1;
            }

            // otherwise, if we're ascending, lowest sorts first
            if (isAscending) {
                return a[field] < b[field] ? -1 : 1;
            }

            // if descending, highest sorts first
            return a[field] < b[field] ? 1 : -1;
        });
        this.formatData(this.sortedData);
        this.showReload = true;
    }

    createColumns(records) {
        let col= [];
        if(typeof(records) === "object") {
            records?.forEach( rec => {
                col.push(...Object.keys(rec));
            });
        }
        if(col.length>0){
            col = [...new Set(col)];
            let idMapped = false;
            col.map((colName) => {
                if (this.isSalesforceData && col.includes('Id') && colName === 'Name') {
                    this.columns.push({
                        label: 'Name',
                        fieldName: 'Name',
                        type: 'url',
                        sortable: true
                    });
                    idMapped = true;
                } else if (idMapped && colName === 'Id') {
                    //skip if Id is already mapped to Name
                } else {
                    this.columns.push({
                        label: colName,
                        fieldName: colName,
                        type: 'text',
                        sortable: true
                    });
                }
            });
        }
        if(this.hoverColumns && this.hoverColumns != '') {
            let cols = this.hoverColumns.split(',');
            if(cols?.length > 7) {
                cols = cols.slice(0, 7);
            }
            if(cols?.length > 0) {
                cols?.map((colName) => {
                    if(col?.includes(colName.trim())) {
                        this.hoverLayoutColumns.push({
                            label: colName.trim(),
                            fieldName: colName.trim(),
                            type: 'text',
                            sortable: true
                        });
                    }
                });
            }
            if(this.hoverLayoutColumns.length > 0){
                this.showHoverOption = true;
            }
        }
    }

    //code for displaying the page number in required format
    visiblePages() {
        let pageLinks = [];
        for (let pageCount = 1; pageCount <= this.totalPages; pageCount++) {
            if (pageCount <= this.totalPages) {
                if (pageCount == this.currentPage) {

                    pageLinks.push({
                        page: pageCount,
                        selected: true
                    });
                }
                else if (pageCount <= this.totalPages) {
                    pageLinks.push({
                        page: parseInt(pageCount,10),
                        selected: false
                    });
                }

            }
        }

        this.tempArr = pageLinks;
        if (pageLinks.length > 6) {
            if (this.currentPage >= 3 && this.currentPage < pageLinks.length - 3) {
                pageLinks = this.generatePagePattern(this.currentPage, this.totalPages, this.tempArr);
            }
            else if (parseInt(this.currentPage,10) === 1 || parseInt(this.currentPage,10) === 2) {
                pageLinks = this.generatePagePattern(2, this.totalPages, this.tempArr);
            }
            else if (parseInt(this.currentPage, 10) === pageLinks.length - 3 || parseInt(this.currentPage, 10) === pageLinks.length - 2 || parseInt(this.currentPage, 10) === pageLinks.length - 1 || parseInt(this.currentPage, 10) === pageLinks.length) {
                pageLinks = this.generatePagePattern(pageLinks.length - 4, this.totalPages, this.tempArr);
            }

        }
        this.pageArray = pageLinks;
    }

    generatePagePattern(currentPage, lastPage, pageLinks) {
        const delta = 3;
        let range = [];
        // Add from end
        for (let i = lastPage - 1; i >= lastPage - delta; i--) {
            range.unshift(pageLinks[i]);
        }
        range.unshift({
            page: '...',
            selected: false
        });

        range.unshift(pageLinks[parseInt(currentPage)]);
        range.unshift(pageLinks[parseInt(currentPage) - 1]);
        range.unshift(pageLinks[parseInt(currentPage) - 2]);
        return range;
    }

    get bDisableFirst() {
        return this.currentPage === 1;
    }
    get bDisableLast() {
        return this.currentPage === this.totalPages;
    }
    get pagestyle() {
        if (this.currentPage) {
            this.btnclassname = "pagenostyle pagenostyleactive"
            return this.btnclassname;
        }
            this.btnclassname = "pagenostyle";
            return this.btnclassname;
    }

    handlePageSelect(event) {
        if (event.currentTarget.dataset.id !== "...") {
            this.selectedcurrrentpage = event.currentTarget.dataset.id;
            this.currentPage = this.selectedcurrrentpage;
            this.formatData(this.currentData, true);
            this.visiblePages();
        }
    }

    handlePrevious() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.formatData(this.currentData, true);
            this.visiblePages();
        }
    }

    handleNext() {
        if (this.currentPage < this.totalPages) {
            this.currentPage++;
            this.formatData(this.currentData, true);
            this.visiblePages();
        }
    }

    handleLast() {
        if (!this.isLastPage) {
            this.currentPage = this.totalPages;
            this.formatData(this.currentData, true);
        }
    }

    handleFirst() {
        if (!this.isFirstPage) {
            this.currentPage = 1;
            this.formatData(this.currentData, true);
        }

    }

    handlePageChange(event) {
        const page = parseInt(event.target.value, 10);
        if (page > 0 && page <= this.totalPages) {
            this.currentPage = page;
            this.formatData(this.currentData, true);
        }
    }

    get isFirstPage() {
        return this.currentPage <= 1;
    }

    get isLastPage() {
        return this.currentPage >= this.totalPages;
    }

    handleRecordsPerPage(event) {
        this.pageSizeLocal = event.target.value;
        if (this.currentPage > 1) {
            this.currentPage = 1;
        }
        this.formatData(this.currentData, true);
    }
}