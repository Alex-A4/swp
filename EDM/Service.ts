class Service{
    private serviceURL : string;

    constructor(serviceURL: string) {
        this.serviceURL = serviceURL;
    }

    public get(methodName : string, query : Object) {
        let URL = `${this.serviceURL}/${methodName}?${this.parseSearchParams(query)}`;

        return new Promise((resolve, reject) =>  {
            fetch(URL)
                .then((response : Response) => response.json())
                .then((responseResult : string) => resolve(responseResult))
                .catch((err : Error) => reject(err))
        });
    }

    public post(methodName : string, query: any){
        let URL = `${this.serviceURL}/${methodName}?${this.parseSearchParams(query)}`;
        return new Promise((resolve, reject) =>  {
            fetch(URL, {method : 'POST', headers: { "Content-Type": "application/json" }})
                .then((response : Response) => response.status)
                .catch((err : Error) => reject(err))
        });

    }

    private parseSearchParams(searchParams : any){
        let queryString = '';

        for(let key in searchParams){
            queryString += `${key}=${JSON.stringify(searchParams[key])}&`;
        }
        return queryString.slice(0, queryString.length - 1);

    }
}

export default Service;
