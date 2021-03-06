import React from "react";
import styled from "styled-components";

export const CancelButtonContainerDiv = styled.div`
    width: 100%;
    height: 10%;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    padding: 4% 8%;
`;
export const TopButtonsContainer = styled.div`
    width: 12%;
    display: flex;
    flex-direction: column;
`;
export const MainSectionContainer = styled.div`
    width: 100%;
    height: 100%;

    padding: 3%;
`;

export const ContainerDivTab = styled.div`
    width: 100%;
    overflow-y: auto;
    height: 80vh;
`;
export const SubSectionTop = styled.div`
    display: flex;
`;
export const ContentContainerDiv = styled.div`
    width: 100%;
    height: 70%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
`;
export const PageHeader = styled.h2`
    fontsize: 30px;
    padding-bottom: 2%;
`;

export const TitleDiv = styled.div`
    font-size: 30px;
    color: black;
    display: flex;
    align-items: center;
    margin-bottom: 100px;
`;

export const HighlightSpan = styled.span`
    font-size: 60px;
    font-weight: 700;
    padding-left: 10px;
`;

export const StartSetupButtonContainerDiv = styled.div`
    width: 30%;
`;

//---------------

export const ContainerDiv = styled.div`
    width: 100%;
    height: 100%;
    display: flex;
`;
export const SubContainerDiv = styled.div`
    padding: 20px;
`;

export const MainSections = styled.div`
    display: flex;
    height: 100%;
    width: 100%;
`;

export const SubSectionDiv = styled.div`
    margin: 5px 0;
    width: 45%;
`;

export const SectionHeader = styled.h4`
    text-align: left;
    color: #2699fb;
    font-size: 20px;
    padding: 0px;
    width: 100%;
`;

export const FirstSectionContainerDiv = styled.div`
    flex: 1;
    padding-right: 20px;
`;

export const SecondSectionContainerDiv = styled.div`
    flex: 2;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
`;

export const SecondSectionInnerContainer = styled.div`
    flex: 1;
    width: 100%;
    height: 100%;
    display: flex;
`;

export const SecondSectionInnerInnerContainer = styled.div`
    flex: 1;
    width: 100%;
    height: 100%;
`;

export const SectionTitleDiv = styled.div`
    color: rgb(38, 153, 251);
    font-size: 1.4em;
    font-weight: 600;
    padding-bottom: 20px;
`;
export const FieldDiv = styled.div`
    width: 100%;
    padding: 0px;
`;
export const FieldLabel = styled.div`
    font-size: 10px;
    margin-bottom: 2px;
    color: #5c5c5c;

    text-transform: uppercase;
`;

export const FormHelperError = styled.p`
    margin-top: 8px;
    font-size: 0.75rem;
    line-height: 1em;
    color: #f44336;
`;

export const LayoutEntryContainerDiv = styled.div`
    width: 100%;
    margin-bottom: 1%;
    height: 120px;
    display: flex;
`;

export const LayoutEntryDropdownDiv = styled.div`
    width: 55%;
    height: 100%;
    float: left;
    margin-right: 2%;
    display: flex;
    flex-direction: column;
    // margin-bottom: 1%;
`;
export const LayoutEntryPreviewDiv = styled.div`
    height: 100px;
    padding-top: 19px;
`;

export const LayoutEntryPreviewImage = styled.img`
    height: 110px;
    margin: 1%;
    border: 1px solid #9d9d9d;
    border-radius: 5px;
    padding: 10px;
`;

//----Publication List

export const HeaderDiv = styled.div`
    width: 100%;
    height: 10%;
    display: flex;
`;

export const PublicationListContainerDiv = styled.div`
    width: 100%;
    height: 450px;
    overflow-x: auto;
    padding-top: 3%;
    padding-bottom: 20px;
    display: flex;
`;

export const PublicationEntryContainerDiv = styled.div`
    // width: 18%;
    width: 260px;
    height: 100%;
    background-color: white;
    border: 1px solid #dddddd;
    box-shadow: 0px 1px 3px #000000;
    margin-right: 30px;
`;

export const PublicationMoreIconContainerDiv = styled.div`
    width: 100%;
    display: flex;
    justify-content: flex-end;
    margin-bottom: 15px;
`;

export const PublicationImageContainerDiv = styled.div`
    width: 100%;
    height: 75%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 0 14px;
`;

export const PublicationName = styled.div`
    width: 84%;
    margin-left: 8%;
    margin-top: 5px;
    padding-bottom: 10px;
    font-size: 17px;
    font-weight: bold;
    border-bottom: 1px solid black;
    color: black;
`;

export const PublicationUpdated = styled.div`
    padding-left: 10%;
    padding-top: 10px;
    color: rgb(157, 157, 157);
`;
