import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Props {
  setShowAlert: (value: boolean) => void;
  title: string;
  content: string;
  button: string;
  showAlert: boolean;
}

export const MyAlertDialog = ({ title, content, button, setShowAlert, showAlert }: Props) => {
  return (
    <AlertDialog open={showAlert} onOpenChange={setShowAlert}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="!pl-1">{title}</AlertDialogTitle>
          <AlertDialogDescription className="!pl-2">{content}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction className="cursor-pointer h-8 !w-25 !z-50 bg-slate-900 rounded-xl !mr-1 !mb-1  !pb-1 shadow text-center text-white hover:bg-slate-800">
            {button}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
