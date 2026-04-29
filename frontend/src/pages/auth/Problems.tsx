import { useEffect } from "react"
import { useProblemStore } from "@/store/useProblemStore"
import PageLoder from "@/assets/pageLoderLoti"


const Problems = () => {

  const{getAllProblems,problems,isProblemsLoading}=useProblemStore()

  useEffect(() => {
    getAllProblems()
  }, [])

  if(isProblemsLoading){
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <PageLoder/>
      </div>
    )
  }
  

  return (
    <div>
      
    </div>
  )
}

export default Problems
