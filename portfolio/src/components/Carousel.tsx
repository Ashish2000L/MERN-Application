import { Carousel as CarouselB } from 'react-bootstrap';
import { CarouselItemProps } from 'react-bootstrap';
import "./carousel.css"

export function Carousel() {
    return (
        <div className='pt-5'>
        <CarouselB >
            <CarouselB.Item interval={1000}>
                <img
                    className="d-block w-100"
                    src="/images/pb_Brand_ID Fresh_ID Fresh_170006-21-2022-134424.webp"
                    alt="First slide"
                />
                <CarouselB.Caption>
                    {/* <h3>First slide label</h3>
          <p>Nulla vitae elit libero, a pharetra augue mollis interdum.</p> */}
                </CarouselB.Caption>
            </CarouselB.Item>
            <CarouselB.Item interval={1000}>
                <img
                    className="d-block w-100"
                    src="/images/pb_Brand_Vim_hul_173006-21-2022-184129.jpg"
                    alt="Second slide"
                />
                <CarouselB.Caption>
                    {/* <h3>Second slide label</h3>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p> */}
                </CarouselB.Caption>
            </CarouselB.Item>
            <CarouselB.Item interval={1000}>
                <img
                    className="d-block w-100"
                    src="/images/pb_Brand_Whisper_P&G_157406-21-2022-134353.jpg"
                    alt="Third slide"
                />
                <CarouselB.Caption>
                    {/* <h3>Third slide label</h3>
          <p>
            Praesent commodo cursus magna, vel scelerisque nisl consectetur.
          </p> */}
                </CarouselB.Caption>
            </CarouselB.Item>
        </CarouselB>
        </div>
    );
}