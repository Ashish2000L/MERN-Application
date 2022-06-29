import storeItems from "../../data/items.json"
import {Col, Row} from "react-bootstrap"
import { StoreItem } from "../../components/StoreItem"
import {useNavigate} from "react-router-dom"


export function Store(){
    
    const navigate = useNavigate();

    if(localStorage.getItem("AuthToken")== null)
    {
        navigate("/");
        return; 
    }

    return(
        <>
        <div className="mt-5 mb-5">
    <Row md={3} xs={2} lg={4} className="g-6">
        {storeItems.map(item=>(
            <Col key={item.id}>
            <StoreItem {...item}/>
            </Col>

        ))}
        
    </Row>
    <p className="d-flex align-items-center justify-content-center mt-5">©<i>2022</i> </p>

    </div>
    </>
    )
}