export interface IConfiguration {
    id: string;
    name: string;
}
export interface IStructure{
    term:string;
    termOfName:string;
    parent:string;
    Id:string;
    Html:string;
    PathOfTerm:string;
}

export interface ITermSetMenuItem{
    id:string;
    name:string;
    path:string;
    parentid:string;
    // children: IChildren;
}