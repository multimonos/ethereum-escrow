export const createToast = (
    {
        type = "info",
        message = ""
    } = {} ) => (
    {
        type,
        message,
        "expiresAt": performance.now() + 5000
    }
)
export const createContract = (
    {
        depositor = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        arbiter = "",
        beneficiary = "",
        amount = 0
    } = {} ) => (
    {
        depositor,
        arbiter,
        beneficiary,
        amount: parseFloat( amount ),
    }
)
export const createDeployment = (
    {
        address = "",
        owner = "",
        balance = 0,
        approved = false,
    } = {} ) => (
    {
        address,
        owner,
        balance,
        approved,
    }
)




