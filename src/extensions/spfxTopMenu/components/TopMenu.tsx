import * as React from 'react';
import { escape } from '@microsoft/sp-lodash-subset';
import PropTypes from 'prop-types';
import { sp } from "@pnp/sp";
import { taxonomy, ITermData, ITerm, ITermSetData} from "@pnp/sp-taxonomy";
import { CommandBar, ICommandBarProps } from 'office-ui-fabric-react/lib/CommandBar';
import { IContextualMenuItem, ContextualMenuItemType } from 'office-ui-fabric-react/lib/ContextualMenu';
import { IConfiguration,IStructure,ITermSetMenuItem } from '../../../models';
import { ConfigService } from '../../../services';
import $ from 'jquery';
import './Header.css';
import styles from './HeaderStyle.module.scss';

export interface ITopMenuProps
{
    terSetId:string;
    depSetId:string;    
}

export interface ITopMenuState
{
    terms : (ITermData & ITerm)[];
    hover : boolean;
    addClass:boolean;
    addMobileMenuClass:boolean;
    addMobileHeader:string;
    clientHeight:number;
    topMenuItems:(ITermSetMenuItem)[];
}

interface ISubMenuProps
{
    navId:string;
}

var menuItems = [];

export default class TopMenu extends React.Component<ITopMenuProps, ITopMenuState> {

    public constructor(props){
        super();
        
        this.state = {
            terms:[],
            hover:false,
            addClass:false,
            addMobileMenuClass:false,
            addMobileHeader:"",
            clientHeight:0,
            topMenuItems:[]
        };
    }

    public hoverOn(value){}
    public hoverOff(){}

    public passItems(Terms){
        
        //Work out Grand Parents of first level terms
        var grandParents = [];
        Terms.forEach(term => {            
            var pathOfTerm = this.splitOnSemiColon(term.PathOfTerm);
            term.parentid = "-1";
            
            var termSetMenuItem = {    
                id:this.getGuid(term.Id), 
                name:term.Name,
                path:term.LocalCustomProperties._Sys_Nav_SimpleLinkUrl,
                parentid:"-1"
            };

            if (pathOfTerm.length == 1)
            {
                if (term.id != "-999")
                {
                    grandParents.push(term);
                    menuItems.push(termSetMenuItem);
                }
            }
        });

        Terms.forEach(term => {            
            var pathOfTerm = this.splitOnSemiColon(term.PathOfTerm);
            if (pathOfTerm.length == 2) 
            {
                var grandParentTerm = term; // Default to current term for initialisation but next step gets the correct grand parent
                grandParentTerm = grandParents.filter( (grandParent) => { return grandParent.Name === pathOfTerm[0];});
                if (grandParentTerm != term) {   
                    if (term.id != "-999") {                 
                        term.parentid = this.getGuid(grandParentTerm[0].Id);

                        var termSetMenuItem = {
                            id:this.getGuid(term.Id),
                            name:term.Name,
                            path:term.LocalCustomProperties._Sys_Nav_SimpleLinkUrl,
                            parentid:this.getGuid(grandParentTerm[0].Id)
                        };
                        menuItems.push(termSetMenuItem);
                    }
                }
            }
        });

        //console.log(menuItems);
        this.setState({topMenuItems:menuItems}); // Needed even though we use menuItems directly. Without this line the menu shows only the initial set value for menuItems, go figure???

    }
    public openMobileNav(){
        this.setState({addClass:!this.state.addClass});
    }

    public openMobileMenu(value){
        this.setState({addMobileHeader: value.currentTarget.id});
        this.setState({addMobileMenuClass:!this.state.addMobileMenuClass});
    }

    public splitOnSemiColon(stringObject){
        return stringObject.split(";");
    }


    public render(): React.ReactElement<ITopMenuProps> {
      
        const headerItems = ConfigService.getItems;
        const currentHeight= this.state.hover?0:50;
        const newHeight = this.state.clientHeight;
        
        let btnBurgerStyle =["btn-burger"];
        let headerStyle = ["header header--primary"];
        // breadcrumbs 
        let breadCrumbsStyle= [" breadcrumbs-mobile primary-nav paddingLeft0"];

        let mobileDepartmentMenu=[""];
        let mobileMyTeamSiteMenu=[""];

        if(this.state.addClass){
            btnBurgerStyle.push("active");
            headerStyle.push("active");
            breadCrumbsStyle.push("active");
        }

        let showNavFirstlevel = menuItems.filter(
            (firstLevel) => {
                return firstLevel.parentid === "-1";
            }
        );

        return (
            <div>
                
            {/* deleted wrapper */}
            <div className="">
            <header className={headerStyle.join(' ')} role="banner" >
                <div className="container-alt">
                    {/* need to add onclick function */}
                    <img src="https://m3propertyunit.sharepoint.com/sites/TempTest/SiteAssets/m3property_logo.png" className="logo paddingLeft0" />
                    <a onClick={this.openMobileNav.bind(this)} className={btnBurgerStyle.join(' ')}>
                        <span></span>
                        <span></span>
                        <span></span>
                    </a>
                    <nav className="nav" role="navigation">
                        {/* ul need to add */}
                        <ul className={breadCrumbsStyle.join(' ')} >
                        
                            { showNavFirstlevel.map((firstLevel) => (

                                <li onMouseEnter={this.hoverOn.bind(this)} onMouseLeave={this.hoverOff.bind(this)} id="{firstLevel.id}">

                                <div className="underline">
                                <span className={mobileDepartmentMenu.join(" ")}>
                                    <a href={firstLevel.path} onClick={this.openMobileMenu.bind(this)} id="{firstLevel.id}">{firstLevel.name}</a>
                                    <ul>
                                    <Submenu navId={firstLevel.id}/>
                                    </ul>
                                        </span>
                                        </div>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </div>
            <div  className="header__curtain" style={{height: newHeight+'px'}}></div>
            </header>
            </div>
            </div>
        );
    }


    // Clean Guid in the returing object
    public getGuid(value){
        var newValue = value.replace("/Guid(","");
        newValue = newValue.replace(")/","");

        return newValue;
    }

    public componentWillMount()
    {
        
        taxonomy.getDefaultSiteCollectionTermStore()
        .getTermSetById(ConfigService.getItemByName("theHub - Top Navigation - Test").id).terms
        .get().then(
            Allterms=>{
                // Allterms;
                console.log(Allterms);
                this.setState({terms:Allterms});
                this.passItems(Allterms);
                {Allterms.map(term=>{
                    term.Id=this.getGuid(term.Id);
                    console.log("term Name:",term.Name);
                    console.log("term Name:",term.LocalCustomProperties._Sys_Nav_SimpleLinkUrl);
                });}
            }
        );
    }
}
export const mouseEvents=()=>{
    const ele = document.getElementById('');
};

class Submenu extends React.Component<ISubMenuProps> {

    public render() {
    
      let showNavSecondlevel = menuItems.filter(
        (secondLevel) => {            
            return secondLevel.parentid === this.props.navId;
        }
      );
      return (
        <div>
            { showNavSecondlevel.map((secondLevel) => (
            <li id={secondLevel.id}><a href={secondLevel.path}>{secondLevel.name}</a></li>
            ))}
        </div>
      );
    }
  }