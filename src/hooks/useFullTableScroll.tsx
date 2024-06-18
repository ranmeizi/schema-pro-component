import { useEffect, useState } from "react"

const PADDING_NOPAGINATION = 52 + 47

export default function useFullTableScroll(selector: string) {
  const [y, setY] = useState(0)

  useEffect(() => {
    const el = document.querySelector(selector)
    const resizeObserver = new ResizeObserver((entries) => {
      console.log(entries, 'resize', entries?.[0]?.contentRect?.height)
      setY(entries?.[0]?.contentRect?.height || 0)
    });

    resizeObserver.observe(el!);

    return () => resizeObserver.unobserve(el!)
  }, [])

  return {
    y: y - PADDING_NOPAGINATION
  }
}