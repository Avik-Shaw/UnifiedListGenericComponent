/*
    Name: UnrelatedListFeeder
    Description: This component is a wrapper component for the UnrelatedList component.
    Author: Avik Shaw
    Date: 2026-01-11
    Version: 1.0
*/
import { LightningElement, api } from 'lwc';
import callApexClass from '@salesforce/apex/ListFeeder.callFeederSource';
export default class UnrelatedListFeeder extends LightningElement {
    @api recordId;
    @api objectApiName;
    @api sourcedata = null;
    @api classinterfaceName;
    @api methodName;
    @api iconName;
    @api title;
    @api pageSize;
    @api isSalesforceData = false;
    @api hoverColumns;
    
    connectedCallback(){
        if(this.classinterfaceName && this.methodName) {
            callApexClass({className: this.classinterfaceName, 
                methodName: this.methodName,
                recordId: this.recordId,
                objectApiName: this.objectApiName
            }).then(result => {
                this.sourcedata = result;
                if(result.length === 0){
                    this.sourcedata = '';
                }
            }).catch(error => {
                console.error('Error while calling feeder class: ' + error);
                this.sourcedata = '';
            });
        } else if(this.sourcedata) {

        } else {
            this.sourcedata = 'NA';
        }
    }
}