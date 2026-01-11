/*
    Name: DemoDataClass
    Description: This class is used to generate demo data for the Salesforce org.
    Author: Avik Shaw
    Date: 2026-01-11
*/
global with sharing class DemoDataClass implements Callable {
    global Object call(String methodName, Map<String, Object> args) {
        if (methodName == 'getAccounts') {
            List<Account> accList = [SELECT Id, Name, Type, Rating, Phone FROM Account Where Type != null
                                     AND Rating != null
                                     AND Phone != Null
                                     LIMIT 50];
            List<Object> resultList = new List<Object>();
            //We can return the accList directly, however below map send custom column names
            for (Account acc : accList) {
                Map<String, Object> fieldMap = new Map<String, Object>();
                
                fieldMap.put('Name', acc.Name);
                fieldMap.put('Account Type', acc.Type);
                fieldMap.put('Level', acc.Rating);
                fieldMap.put('Contact Number', acc.Phone);
                fieldMap.put('Id', acc.Id);
                
                resultList.add(fieldMap);
            }
            
            return resultList;
        }
        return null;
    }
}