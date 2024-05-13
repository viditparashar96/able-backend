const collectionModel = require("../models/collectionModel");
const { catchAsyncErrors } = require("../middleware/catchAsyncErrors");
const EditRequest = require("../models/editRequestModel");

// Create
export const createEditRequest = catchAsyncErrors(
  async (req: any, res: any, next: any) => {
    try {
      const editRequest = await EditRequest.create(req.body);

      editRequest.userId = req.Userid;
      editRequest.save();
      console.log(editRequest);

      res.status(201).json({ success: true, data: editRequest });
    } catch (err:any) {
      if (err.code === 11000 && err.keyPattern && err.keyPattern.invoice_id) {
        return res
          .status(400)
          .json({ success: false, message: "Invoice ID already exists" });
      }

      res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    }
  }
);

// Read all
export const getAllEditRequests = catchAsyncErrors(
  async (req: any, res: any, next: any) => {
    const editRequests = await EditRequest.find({ userId: req.Userid });
    res.status(200).json({ success: true, data: editRequests });
  }
);


// Delete
export const deleteEditRequest = catchAsyncErrors(
  async (req: any, res: any, next: any) => {
    const editRequest = await EditRequest.findByIdAndDelete(req.params.id);
    if (!editRequest) {
      return res
        .status(404)
        .json({ success: false, message: "Edit request not found" });
    }
    res
      .status(200)
      .json({ success: true, message: "Edit request deleted successfully" });
  }
);



// admin

export const getEditReqListAdmin = catchAsyncErrors(
    async (req: any, res: any, next: any) => {
        const editRequests = await EditRequest.find({ status: "pending" });
        res.status(200).json({ success: true, data: editRequests });
    }
);
  


export const updateAmountAndStatus = catchAsyncErrors(
    async (req: any, res: any, next: any) => {
        const { invoice_id, newAmount } = req.body;

   
        const editRequest = await EditRequest.findOne({ invoice_id });

        if (!editRequest) {
            return res.status(404).json({ success: false, message: "Edit request not found" });
        }

    
        const collectionDocument = await collectionModel.findOneAndUpdate(
            { invoice_id },
            { $set: { amount: newAmount } },
            { new: true } 
        );

        if (!collectionDocument) {
            return res.status(404).json({ success: false, message: "Collection document not found" });
        }

      
        editRequest.status = "accepted"; 
        await editRequest.save();

        // Respond with success message
        res.status(200).json({ success: true, message: "Amount updated and status changed to accepted" });
    }
);
