from fastapi import APIRouter, File, HTTPException, UploadFile

from app.services.upload_service import save_uploaded_file


router = APIRouter()



@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...)
):
    contents = await file.read()

    try:
        metadata = save_uploaded_file(file, contents)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    return metadata
