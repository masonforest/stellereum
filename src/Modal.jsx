import {useEffect, useRef, useState} from "react"
// import { Modal as Modal2 } from "bootstrap";
import { useModal } from "./react-bootstrap";

export default function Modal(props) {
  const { children, show } = props;
  // const modalRef = useRef();
  // const [modal, setModal] = useState();
  const modalRef = useModal(show);
//   useEffect(() => {
//         if (modalRef.current) {
//           const modal = new Modal2(modalRef.current)
//           setModal(modal)
//         }
//     },[])
//   useEffect(() => {
//         if (modal) {
//       if(show) {
//       modal.show()
//       } else {
//       modal.hide()
//       }
// }
//   }, [show])
  return (
    <div className="modal fade" ref={modalRef}>
      <div className="modal-dialog">
        <div className="modal-content">{children}</div>
      </div>
    </div>
  );
}
