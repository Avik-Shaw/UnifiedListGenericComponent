/**
 * Class ListFeeder
 * Description: Invokes a Callable feeder class/method to supply data to a related-list-like component.
 * Author: Avik Shaw
 * Date: 2026-01-11
 * Version: 1.0
 *
 * Notes:
 * - Uses System.Callable interface with dynamic type resolution.
 * - Validates inputs to avoid NullPointerExceptions and to satisfy PMD best practices.
 */
public with sharing class ListFeeder {

    /**
     * Invokes a feeder source method on a provided class implementing Callable.
     *
     * @param className     Fully qualified Apex class name that implements System.Callable.
     * @param methodName    Method name to call via Callable.call.
     * @param recordId      Context record Id.
     * @param objectApiName API name of the SObject for context.
     * @return              Result returned by the Callable implementation.
     * @throws              IllegalArgumentException if inputs are invalid or type cannot be resolved.
     */
    @AuraEnabled
    public static Object callFeederSource(String className, String methodName, String recordId, String objectApiName) {
        // Validate inputs (PMD: AvoidNullPointerExceptions, ValidateArguments)
        if (String.isBlank(className)) {
            throw new IllegalArgumentException('className must be provided.');
        }
        if (String.isBlank(methodName)) {
            throw new IllegalArgumentException('methodName must be provided.');
        }

        Map<String, Object> argMap = new Map<String,Object>{'recordId'=> recordId, 'objectApiName'=> objectApiName};
        Callable extension = (Callable)Type.forName(className).newInstance();
        Object result = extension.call(methodName, argMap);
        return result;
    }
}